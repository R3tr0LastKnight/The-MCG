import React, { useEffect, useRef, useState } from "react";
import Pack from "../components/Pack";
import * as htmlToImage from "html-to-image";
import { motion } from "framer-motion";
import Card from "../components/Card";
import { Progress } from "../components/ui/Progress.tsx";
import {
  addExp,
  getUserCardByTrack,
  getUserCardWithTrack,
  saveCard,
  saveOrReplaceCard,
} from "../api/spotify";
import { auth } from "../firebase";
import { useUser } from "../utils/userContext";
import CardReRender from "../components/CardRerenderer";
import SplashCursor from "../components/ui/SplashCursor";

const PacksPage = () => {
  const [pack, setPack] = useState("");
  const [imgSrc, setImgSrc] = useState(null);
  const [showPack, setShowPack] = useState(true);
  const [colors, setColors] = useState({});
  const [burned, setBurned] = useState(false);
  const [showChoose, setShowChoose] = useState(false);
  const [packData, setPackData] = useState({
    bgColor: "",
    textColor: "",
    index: 0,
  });
  const [keep, setKeep] = useState(0);
  const [exp, setExp] = useState(0);
  const [progress, setProgress] = useState(0); // percentage for bar
  const [userLevel, setUserLevel] = useState(1);
  const [oldExp, setOldExp] = useState(0);
  const { user, setUser } = useUser();
  const [tempTrack, setTempTrack] = useState();
  const [oldCard, setOldCard] = useState();
  const [choosin, setChoosin] = useState(0);
  const [cardData2, setCardData2] = useState({});
  const [showButton, setShowButton] = useState(true);
  const [packRevealed, setPackRevealed] = useState(false); // after clicking "Open Pack"
  const [hasOpened, setHasOpened] = useState(false); // after hover finishes

  const screenshotArea = useRef(null);

  useEffect(() => {
    if (imgSrc) {
      setShowPack(false); // ✅ show captured card instead of pack
    } else {
      setShowPack(true); // fallback to showing unopened pack
    }
  }, [imgSrc]);

  // click handler
  const handleOpenPackClick = async () => {
    await handleCapture(); // take screenshot
    setShowButton(false); // hide button
    setPackRevealed(true); // now show screenshot, but not open yet
    console.log("color:", packData);
  };

  const holdTimerRef = useRef(null);
  const HOLD_DURATION = 2000; // ms → how long to hold before burn

  const startHold = (e) => {
    // prevent scrolling on touch devices
    if (e && (e.type === "touchstart" || e.pointerType === "touch")) {
      e.preventDefault?.();
    }

    // clear any old timer
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    holdTimerRef.current = window.setTimeout(() => {
      setHasOpened(true);
      setShowPack(false);
      holdTimerRef.current = null;
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!screenshotArea.current) {
      console.error("Capture failed: element not found");
      return;
    }

    try {
      const style = getComputedStyle(screenshotArea.current);
      const bgColor = packData.bgColor; // fallback to white

      const dataUrl = await htmlToImage.toPng(screenshotArea.current, {
        quality: 1,
        backgroundColor: bgColor,
      });

      setImgSrc(dataUrl);
    } catch (err) {
      console.error("Capture failed:", err);
    }
  };

  useEffect(() => {
    if (keep === 2) {
      const pushCard = async () => {
        try {
          if (!oldCard) {
            // no duplicate → just save new card
            console.log("card Data :", cardData2);

            await saveOrReplaceCard(auth.currentUser?.uid, {
              newCard: cardData2?.data,
            });
          } else if (choosin === 1) {
            // replace oldCard with cardData2
            await saveOrReplaceCard(auth.currentUser?.uid, {
              newCard: cardData2?.data,
              oldCard: oldCard?.data,
            });
          } else if (choosin === 2) {
            // keep old card → no backend update
            console.log("Kept old card, no backend update");
          }

          setKeep(3);
        } catch (err) {
          console.error("Error saving card:", err);
        }
      };

      pushCard();
    }
  }, [keep, choosin, cardData2, oldCard]);

  useEffect(() => {
    if (keep === 3) {
      async function addFinalExp() {
        try {
          // ✅ Skip XP if old card was chosen
          if (choosin === 2) {
            console.log("Kept old card → no XP awarded");
            return;
          }

          const gainedExp = exp;
          console.log("sent xp: ", exp);

          const result = await addExp(auth.currentUser?.uid, gainedExp);

          const updatedUser = { ...user, level: result.level, exp: result.exp };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          setUserLevel(result.level);

          // Calculate old vs new percentages
          const oldPercent = (oldExp / 1000) * 100;
          const newPercent = (result.exp / 1000) * 100;

          // Animate smoothly: start from old, then go to new
          setProgress(oldPercent);
          setTimeout(() => {
            setProgress(newPercent);
          }, 200);

          console.log("temp:", tempTrack);

          // Save latest exp for next time
          setOldExp(result.exp);
        } catch (err) {
          console.error(err.message);
        }
      }

      addFinalExp();
    }
  }, [keep]);

  console.log("keep:", keep);

  useEffect(() => {
    const checkExistingCard = async () => {
      if (keep === 2 && tempTrack) {
        try {
          const data = await getUserCardWithTrack(
            auth.currentUser?.uid,
            tempTrack.track.id
          );

          if (!data || !data.exists) {
            console.log("No old card found → skipping chooser");
            // 🚀 skip straight to XP step
            setKeep(3);
            setChoosin(1);
            return;
          }

          // Normalize and save old card → now chooser makes sense
          const normalized = mapOldCardResponse(data);
          setOldCard(normalized);
        } catch (err) {
          if (err.message?.includes("404") || err.response?.status === 404) {
            console.log("No old card found → skipping chooser");
            setKeep(3); // 🚀 skip chooser
          } else {
            console.error("Unexpected error fetching old card:", err);
          }
        }
      }
    };

    checkExistingCard();
  }, [keep, tempTrack]);

  function mapOldCardResponse(res) {
    if (!res.exists) return null;

    const { card, track } = res;

    return {
      data: {
        trackId: card.trackId,
        albumId: card.albumId,
        border: card.border,
        bgSubId: card.bgSubId,
        effectId: card.effectId,
      },
      track: {
        track: {
          id: track.id,
          name: track.name,
          duration_ms: track.duration_ms,
          popularity: track.popularity,
          preview_url: track.preview_url,
          external_url: track.external_urls.spotify,
        },

        album: {
          id: track.album.id,
          artist: track.artists?.[0]?.name ?? "Unknown",
          name: track.album.name,
          image: track.album.images?.[0]?.url ?? null,
          spotifyUrl: track.album.external_urls.spotify,
        },
      },
    };
  }

  function parseColor(color) {
    if (color.startsWith("#")) {
      // HEX → RGB
      const bigint = parseInt(color.slice(1), 16);
      const r = ((bigint >> 16) & 255) / 255;
      const g = ((bigint >> 8) & 255) / 255;
      const b = (bigint & 255) / 255;
      return { r, g, b };
    } else if (color.startsWith("rgb")) {
      // rgb(...) → { r, g, b }
      const nums = color.match(/\d+/g).map(Number);
      return {
        r: nums[0] / 255,
        g: nums[1] / 255,
        b: nums[2] / 255,
      };
    }
    return { r: 0, g: 0, b: 0 }; // fallback black
  }

  return (
    <div className="transition ">
      {!showButton && !burned && (
        <SplashCursor
          SIM_RESOLUTION={32} // ↓ lower = faster (default is often 128+)
          DYE_RESOLUTION={128} // good balance between smooth color and perf
          CAPTURE_RESOLUTION={100} // keep modest
          DENSITY_DISSIPATION={1} // colors fade gradually
          VELOCITY_DISSIPATION={0.5} // smoother motion, less chaotic
          PRESSURE={0.2} // stable fluid without jitter
          PRESSURE_ITERATIONS={4} // reduce from heavy 20–30
          CURL={15} // nice swirls without heavy calc
          SPLAT_RADIUS={0.12} // smaller splats for less load
          SPLAT_FORCE={2000} // reasonable force
          SHADING={true} // keep shading for nice 3D feel
          COLOR_UPDATE_SPEED={20} // not too frequent → better perf
          BACK_COLOR={parseColor(packData.bgColor)}
          TRANSPARENT={true} // lets background show throughbg
          packColor={packData}
        />
      )}
      <div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
        {showPack ? (
          <div>
            <Pack
              pack={pack}
              setPack={setPack}
              imgSrc={imgSrc}
              setImgSrc={setImgSrc}
              handleCapture={handleCapture}
              colors={colors}
              setColors={setColors}
              screenshotArea={screenshotArea}
              packData={packData}
              setPackData={setPackData}
            />
          </div>
        ) : (
          <>
            {!showButton && !burned ? (
              <div className="absolute bottom-56 whitespace-nowrap   cursor-pointer">
                Hover over card to open it
              </div>
            ) : (
              <></>
            )}

            <motion.div
              initial={{ clipPath: "circle(100% at 50% 50%)" }}
              animate={
                hasOpened
                  ? { clipPath: "circle(0% at 50% 50%)" }
                  : { clipPath: "circle(100% at 50% 50%)" }
              }
              transition={{ duration: 2, ease: "easeInOut" }}
              onAnimationComplete={() => {
                if (hasOpened) setBurned(true);
              }}
              // ✅ unified hover / press support
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") startHold(e); // hover for desktop
              }}
              onPointerLeave={cancelHold}
              onPointerDown={startHold} // press for touch or mouse
              onPointerUp={cancelHold}
              onPointerCancel={cancelHold}
              // fallback for old browsers without PointerEvent
              onTouchStart={(e) => {
                if (typeof window !== "undefined" && !window.PointerEvent)
                  startHold(e);
              }}
              onTouchEnd={(e) => {
                if (typeof window !== "undefined" && !window.PointerEvent)
                  cancelHold();
              }}
              style={{ touchAction: "none" }} // disable scroll during hold
              className="h-[400px] w-[300px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] absolute z-20"
            >
              <motion.img
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                src={imgSrc}
                alt="Captured Pack"
              />
              <motion.img
                className="absolute inset-0 w-full h-full object-cover rounded-lg "
                src={imgSrc}
                alt="Captured Pack"
              />
            </motion.div>
            <div className="absolute z-10">
              {keep < 1 ? (
                <Card
                  pack={pack}
                  imgSrc={imgSrc}
                  setShowChoose={setShowChoose}
                  keep={keep}
                  setKeep={setKeep}
                  setExp={setExp}
                  setTempTrack={setTempTrack}
                  cardData2={cardData2}
                  setCardData2={setCardData2}
                />
              ) : (
                <></>
              )}
            </div>
          </>
        )}
        {pack && !packRevealed && showButton && (
          <div
            style={{
              backgroundColor: packData.bgColor,
              color: packData.textColor,
            }}
            className="px-4 py-1 text-lg rounded-lg cursor-pointer absolute bottom-0 transition"
            onClick={handleOpenPackClick}
          >
            Open Pack
          </div>
        )}
      </div>
      {showChoose ? (
        <>
          {!user ? (
            <>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-full text-center">
                Login to save your cards
              </div>
            </>
          ) : (
            <></>
          )}

          {keep < 1 && burned === true ? (
            <div className="absolute left-1/2  transform -translate-x-1/2 bottom-0  lg:left-[70%] lg:top-32 lg:translate-x-0 flex gap-2 flex-col ">
              <h1 className="font-concent hidden lg:flex text-xl lg:text-6xl">
                CHOOSE
              </h1>
              <div className="flex lg:flex-col gap-2">
                {user ? (
                  <div
                    onClick={() => {
                      setKeep(2);
                    }}
                    className=" border py-2 px-3 rounded bg-white hover:text-white hover:bg-black"
                  >
                    KEEP
                  </div>
                ) : (
                  <></>
                )}

                <div
                  onClick={() => {
                    window.location.reload();
                  }}
                  className=" border py-2 px-3 rounded bg-white hover:text-white hover:bg-black"
                >
                  DISCARD
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}

      {keep === 2 && oldCard ? (
        <div className="flex flex-col scale-50 lg:scale-100 items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-4">
          <h1 className="text-6xl font-concent">Choose 1 to keep</h1>
          <div className="flex items-center justify-center gap-6">
            {/* New Card */}
            <div className="z-50 flex relative items-center gap-0">
              <div className="flex items-center whitespace-nowrap relative z-40 text-center justify-center w-12 h-40 bg-white  rounded-tl-lg rounded-bl-lg shadow-[5px_3px_10px_rgb(0,0,0,0.2)]">
                <div className="-rotate-90 font-poppins">New Shiny Card</div>
              </div>
              <div className="cursor-pointer">
                <CardReRender
                  cardData={cardData2}
                  type="new"
                  onClick={() => setChoosin(1)}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Old Card UI */}
            <div>or</div>
            <div className="z-50 flex relative items-center gap-0">
              <div className="cursor-pointer">
                <CardReRender
                  cardData={oldCard}
                  type="old"
                  onClick={() => setChoosin(2)}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex items-center whitespace-nowrap relative z-40 text-center justify-center w-12 h-56 bg-white  rounded-tr-lg rounded-br-lg shadow-[5px_3px_10px_rgb(0,0,0,0.2)]">
                <div className="rotate-90 font-poppins">
                  Card from your collection
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {keep === 3 ? (
        <>
          <div className=" h-[400px] w-[350px] shadow-[0_3px_10px_rgb(0,0,0,0.2)] absolute  p-4 rounded-lg left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 !bg-white lg:bg-transparent z-50 lg:left-[35%] lg:top-64 lg:translate-x-0 items-center  flex gap-2 flex-col ">
            <div
              onClick={() => {
                window.location.reload();
              }}
              className="absolute top-3 right-3 lg:-top-10 lg:-right-10 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="font-concent lg:flex text-3xl lg:text-6xl h-1/4 underline whitespace-nowrap ">
              {choosin === 1 ? <>XP Gained</> : <>No XP Gained</>}
            </h1>
            <div className="text-center">
              {choosin === 2 ? (
                <div className="h-[15%] ">
                  You've choosen to keep card from your collection
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-col justify-center h-2/4 w-full px-4 gap-2">
              <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold grid grid-cols-1">
                  <p>
                    <span className="font-bold">Album:</span>{" "}
                    {tempTrack?.album.name}
                  </p>
                  <p>
                    <span className="font-bold">Track:</span>{" "}
                    {tempTrack?.track.name}
                  </p>
                  <p>
                    <span className="font-bold">Artist:</span>{" "}
                    {tempTrack?.album.artist}
                  </p>
                  <p>
                    <span className="font-bold">Popularity:</span>{" "}
                    {tempTrack?.track.popularity}
                  </p>
                  {choosin === 1 ? (
                    <>
                      <p>
                        <span className="font-bold">XP:</span> {exp}
                      </p>
                    </>
                  ) : (
                    <></>
                  )}
                </div>

                {choosin === 1 ? (
                  <>
                    <div className="text-lg font-semibold">
                      Level {userLevel}
                    </div>
                    <Progress
                      value={progress}
                      className="bg-white border [&>div]:bg-black transition-all duration-1000 ease-out"
                    />
                    <div className="text-sm text-gray-600">
                      {Math.round(progress)}%
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PacksPage;
