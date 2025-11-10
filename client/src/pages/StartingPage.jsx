/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line react-hooks/exhaustive-deps
import React, { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { motion } from "framer-motion";
import { Progress } from "../components/ui/Progress.tsx";
import {
  addExp,
  getUserCardWithTrack,
  saveOrReplaceCard,
} from "../api/spotify";
import { auth } from "../firebase";
import { useUser } from "../utils/userContext";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
} from "../components/ui/drawer.jsx";
import SplashCursor from "../components/ui/SplashCursor.jsx";
import CardReRender from "../components/CardRerenderer.jsx";
import Pack from "../components/Pack.jsx";
import Card from "../components/Card.jsx";

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
  const [open, setOpen] = useState(false);
  // const [hasCheckedOld, setHasCheckedOld] = useState(false);

  useEffect(() => {
    if (imgSrc) {
      setShowPack(false); // ✅ show captured card instead of pack
    } else {
      setShowPack(true); // fallback to showing unopened pack
    }
  }, [imgSrc]);

  // Handle drawer close
  const handleOpenChange = (nextOpen) => {
    // Detect drag down (user closes drawer manually)
    if (!nextOpen && open) {
      // reload page on drag close
      window.location.reload();
      return; // prevent state update so background click won’t close
    }

    // prevent closing by clicking overlay
    if (!nextOpen) return;

    setOpen(nextOpen);
  };

  // click handler
  const handleOpenPackClick = async () => {
    await handleCapture(); // take screenshot
    setShowButton(false); // hide button
    setPackRevealed(true); // now show screenshot, but not open yet
    // console.log("color:", packData);
  };

  const holdTimerRef = useRef(null);
  const HOLD_DURATION = 1000; // ms → how long to hold before burn

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
      // ✅ 1. Ensure fonts are fully loaded before capture
      if (document.fonts && document.fonts.ready) {
        // console.log("⏳ Waiting for fonts to finish loading...");
        await document.fonts.ready;
        // console.log("✅ Fonts loaded");
      }

      // ✅ 2. Clone all Google Font <link> elements and inline their CSS text
      const fontLinks = Array.from(
        document.querySelectorAll('link[href*="fonts.googleapis.com"]')
      );
      for (const link of fontLinks) {
        try {
          const res = await fetch(link.href, { mode: "cors" });
          const cssText = await res.text();
          const style = document.createElement("style");
          style.textContent = cssText;
          document.head.appendChild(style);
        } catch (err) {
          console.warn("⚠️ Failed to inline font CSS:", link.href, err);
        }
      }

      // ✅ 3. Filter out only accessible styleSheets
      // const safeSheets = Array.from(document.styleSheets).filter((sheet) => {
      //   try {
      //     void sheet.cssRules;
      //     return true;
      //   } catch {
      //     return false;
      //   }
      // });

      // Temporarily override document.styleSheets
      // const originalSheets = document.styleSheets;
      // Object.defineProperty(document, "styleSheets", {
      //   value: safeSheets,
      //   configurable: true,
      // });

      // ✅ 4. Capture the element
      const dataUrl = await htmlToImage.toPng(screenshotArea.current, {
        backgroundColor: packData.bgColor || "#ffffff",
        cacheBust: true,
        quality: 1,
      });

      // ✅ 5. Restore state
      delete document.styleSheets;

      setImgSrc(dataUrl);
      // console.log("✅ Capture succeeded, fonts included");
    } catch (err) {
      console.error("Capture failed:", err);
    }
  };

  useEffect(() => {
    const handleCardFlowV2 = async () => {
      if (keep !== 2 || !tempTrack) return;

      try {
        // 🧩 STEP 1 — Check if the card already exists in DB
        const data = await getUserCardWithTrack(
          auth.currentUser?.uid,
          tempTrack.track.id
        );

        // ✅ CASE 1: No existing card
        if (!data || !data.exists) {
          console.log("🆕 No old card found → saving new card directly...");
          await saveOrReplaceCard(auth.currentUser?.uid, {
            newCard: cardData2?.data,
          });

          // setHasCheckedOld(true);
          setChoosin(1); // mark as chosen (UI consistency)
          setKeep(3); // move to next phase
          return;
        }

        // ✅ CASE 2: Old card exists → store it for chooser UI
        const normalized = mapOldCardResponse(data);
        setOldCard(normalized);
        // setHasCheckedOld(true);
        console.log("📀 Old card found — waiting for user choice...");

        // 🧠 Now, wait until the user chooses (choosin changes from 0)
        const waitForUserChoice = () =>
          new Promise((resolve) => {
            const interval = setInterval(() => {
              if (choosin === 1 || choosin === 2) {
                clearInterval(interval);
                resolve(choosin);
              }
            }, 100);
          });

        const choice = await waitForUserChoice();

        // ✅ CASE 2A: User chose new card → replace old one
        if (choice === 1) {
          console.log("💾 User chose NEW card → replacing old one...");
          await saveOrReplaceCard(auth.currentUser?.uid, {
            newCard: cardData2?.data,
            oldCard: normalized?.data,
          });
        }

        // ✅ CASE 2B: User kept old card → skip save
        if (choice === 2) {
          console.log("🧠 User kept OLD card → skipping save.");
        }

        // ✅ Done
        setKeep(3);
      } catch (err) {
        console.error("❌ Error in unified card flow v2:", err);
      }
    };

    handleCardFlowV2();
  }, [keep, tempTrack, choosin]);

  // console.log("keep:", keep);

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

  useEffect(() => {
    if (keep === 3) {
      if (keep === 3) {
        setOpen(true);
      } else {
        setOpen(false);
      }
      async function addFinalExp() {
        try {
          // ✅ Skip XP if old card was chosen
          if (choosin === 2) {
            // console.log("Kept old card → no XP awarded");
            return;
          }

          const gainedExp = exp;
          // console.log("sent xp: ", exp);

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

          // console.log("temp:", tempTrack);

          // Save latest exp for next time
          setOldExp(result.exp);
          setOldCard();
        } catch (err) {
          console.error(err.message);
        }
      }

      addFinalExp();
    }
  }, [keep]);

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
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <div className=" ">
        {!showButton && !burned && (
          <SplashCursor
            SIM_RESOLUTION={16} // ↓ BIG boost. Halve computation again
            DYE_RESOLUTION={64} // enough color detail
            CAPTURE_RESOLUTION={64} // low but still crisp trails
            DENSITY_DISSIPATION={1.1} // fade faster → fewer pixels to track
            VELOCITY_DISSIPATION={0.6} // smoother, slower flow
            PRESSURE={0.18}
            PRESSURE_ITERATIONS={2} // 2 is good for mobile, 4+ is expensive
            CURL={8} // keep swirls but lighten math
            SPLAT_RADIUS={0.1}
            SPLAT_FORCE={1500} // lower force = fewer particle explosions
            SHADING={false} // 🚨 huge GPU saver on phones
            COLOR_UPDATE_SPEED={12} // decrease updates
            BACK_COLOR={parseColor(packData.bgColor)}
            TRANSPARENT={true}
            packColor={packData}
            // HIGH_QUALITY={false} // ⬅️ add this flag in your fluid shader if supported
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
                <div className="absolute top-52  whitespace-nowrap    ">
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
                className="h-[400px] w-[300px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] absolute z-20 cursor-target"
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
              className=" px-3 py-3 text-lg rounded-full shadow-[0px_2px_10px_rgb(0,0,0,0.2)]  absolute -bottom-1 left-[37%] cursor-target"
              onClick={() => {
                setPack("");
                setPackData({
                  bgColor: "",
                  textColor: "",
                  index: 0,
                });
              }}
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
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </div>
          )}
          {pack && !packRevealed && showButton && (
            <div
              style={{
                backgroundColor: packData.bgColor,
                color: packData.textColor,
              }}
              className="px-4 font-bitcount py-1 text-lg rounded-lg shadow-[0px_2px_10px_rgb(0,0,0,0.2)]  absolute bottom-0  cursor-target"
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
                <div className="absolute left-1/2 transform -translate-x-1/2 w-full text-center ">
                  Login to save your cards
                </div>
              </>
            ) : (
              <></>
            )}

            {keep < 1 && burned === true ? (
              <div className="absolute left-1/2  transform -translate-x-1/2 bottom-6  lg:left-[70%] lg:top-32 lg:translate-x-0 flex gap-2 flex-col ">
                <h1 className="font-cinzel hidden lg:flex text-xl lg:text-6xl">
                  CHOOSE
                </h1>
                <div className="flex lg:flex-col gap-2">
                  {user ? (
                    <div
                      onClick={() => {
                        setKeep(2);
                      }}
                      className="cursor-target border py-2 px-3 rounded bg-white hover:text-white hover:bg-black"
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
                    className="cursor-target border py-2 px-3 rounded bg-white hover:text-white hover:bg-black"
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
            <h1 className="text-6xl font-cinzel">Choose 1 to keep</h1>
            <div className="flex items-center justify-center gap-6">
              {/* New Card */}
              <div className="z-50 flex relative items-center gap-0">
                <div className="flex items-center whitespace-nowrap relative z-40 text-center justify-center w-12 h-40 bg-white  rounded-tl-lg rounded-bl-lg shadow-[5px_3px_10px_rgb(0,0,0,0.2)]">
                  <div className="-rotate-90 font-poppins">New Shiny Card</div>
                </div>
                <div className="  cursor-target">
                  <CardReRender
                    cardData={cardData2}
                    type="new"
                    onClick={() => setChoosin(1)}
                    className=" "
                  />
                </div>
              </div>

              {/* Old Card UI */}
              <div>or</div>
              <div className="z-50 flex relative items-center gap-0">
                <div className="  cursor-target">
                  <CardReRender
                    cardData={oldCard}
                    type="old"
                    onClick={() => setChoosin(2)}
                    className=" "
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
            <DrawerContent className="bg-white ">
              <div className="absolute left-1/2 bottom-[25%] transform -translate-x-1/2 -translate-y-1/2 scale-90 z-50">
                <CardReRender
                  cardData={choosin === 2 ? oldCard : cardData2}
                  type={choosin === 2 ? "old" : "new"}
                  className=" "
                />
              </div>
              <DrawerDescription>
                <div className=" p-4 rounded-xl relative bg-white lg:bg-transparent z-40 items-center flex gap-2 flex-col">
                  {progress || choosin === 2 ? (
                    <div
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="absolute top-3 right-3 lg:top-4 lg:right-[35%]  z-40 cursor-target"
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
                  ) : (
                    <></>
                  )}
                  <h1 className="font-bitcount lg:flex text-3xl lg:text-5xl h-1/4   whitespace-nowrap ">
                    {choosin === 1 ? (
                      <div className="mt-4">XP Gained</div>
                    ) : (
                      <>No XP Gained</>
                    )}
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
                  <div className="flex flex-col justify-center h-2/4  px-4 gap-2 lg:w-[400px]">
                    <div className="flex flex-col gap-2 font-libertinus">
                      <div className="  text-sm grid grid-cols-1">
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
              </DrawerDescription>

              <DrawerFooter>
                {/* <DrawerClose>
                  {progress || choosin === 2 ? (
                    <div className="flex w-full justify-center">
                      <div
                        className="cursor-target border py-2 px-3 w-20 rounded bg-white hover:text-white hover:bg-black "
                        onClick={() => {
                          window.location.reload();
                        }}
                      >
                        Home
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </DrawerClose> */}
              </DrawerFooter>
            </DrawerContent>
          </>
        ) : (
          <></>
        )}
      </div>
    </Drawer>
  );
};

export default PacksPage;
