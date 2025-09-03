import React, { useEffect, useRef, useState } from "react";
import Pack from "../components/Pack";
import * as htmlToImage from "html-to-image";
import { motion } from "framer-motion";
import Card from "../components/Card";
import { Progress } from "../components/ui/Progress.tsx";
import { addExp } from "../api/spotify";
import { auth } from "../firebase";
import { useUser } from "../utils/userContext";
import { isLoggedIn } from "../utils/auth";

const PacksPage = () => {
  const [pack, setPack] = useState("");
  const [imgSrc, setImgSrc] = useState(null);
  const [showPack, setShowPack] = useState(true);
  const [colors, setColors] = useState({});
  const [burned, setBurned] = useState(false);
  const [getCard, setGetCard] = useState(false);
  const [showChoose, setShowChoose] = useState(false);
  const [packData, setPackData] = useState({
    bgColor: "",
    textColor: "",
    index: 0,
  });
  const [keep, setKeep] = useState(null);
  const [exp, setExp] = useState(0);
  const [progress, setProgress] = useState(0); // percentage for bar
  const [userLevel, setUserLevel] = useState(1);
  const [oldExp, setOldExp] = useState(0);
  const { user, setUser } = useUser();
  const [tempTrack, setTempTrack] = useState();
  const [login, setLogin] = useState(isLoggedIn());

  const screenshotArea = useRef(null);
  useEffect(() => {
    if (imgSrc) {
      const timer = setTimeout(() => {
        setShowPack(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowPack(true);
    }
  }, [imgSrc]);

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
      async function addFinalExp() {
        try {
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

  useEffect(() => {
    setGetCard(!getCard);
  }, [pack]);

  return (
    <div className="transition ">
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
            <motion.div
              initial={{ clipPath: "circle(100% at 50% 50%)" }}
              animate={{ clipPath: "circle(0% at 50% 50%)" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              onAnimationComplete={() => setBurned(true)}
              className="h-[400px] w-[300px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] absolute z-20"
            >
              <motion.img
                className="absolute inset-0 w-full h-full object-cover rounded-lg "
                src={imgSrc}
                alt="Captured Pack"
              />
            </motion.div>
            <div className="absolute z-10">
              <Card
                pack={pack}
                getCard={getCard}
                imgSrc={imgSrc}
                setShowChoose={setShowChoose}
                keep={keep}
                setKeep={setKeep}
                setExp={setExp}
                setTempTrack={setTempTrack}
              />
            </div>
          </>
        )}
        {pack && showPack ? (
          <div
            style={{
              backgroundColor: packData.bgColor,
              color: packData.textColor,
            }}
            className={` px-4 py-1 text-lg rounded-lg cursor-pointer absolute bottom-0 transition`}
            onClick={() => {
              handleCapture();
            }}
          >
            Open Pack
          </div>
        ) : (
          <></>
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

          <div className="absolute left-1/2  transform -translate-x-1/2 bottom-0  lg:left-[70%] lg:top-32 lg:translate-x-0 flex gap-2 flex-col ">
            <h1 className="font-concent hidden lg:flex lg:text-6xl">CHOOSE</h1>
            <div className="flex lg:flex-col gap-2">
              {user ? (
                <div
                  onClick={() => {
                    setKeep(1);
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
        </>
      ) : (
        <></>
      )}
      {keep === 2 ? (
        <>
          <div className="absolute w-2/3 p-4 rounded left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white lg:bg-transparent z-50 lg:left-[40%] lg:top-64 lg:translate-x-0 items-center  flex gap-2 flex-col ">
            <h1 className="font-concent lg:flex text-xl lg:text-6xl">
              XP Gained
            </h1>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold grid grid-cols-1">
                  <p>
                    <span className="font-bold">Album:</span>{" "}
                    {tempTrack?.album.name}
                  </p>
                  <p>
                    <span className="font-bold">Artist:</span>{" "}
                    {tempTrack?.album.artist}
                  </p>
                  <p>
                    <span className="font-bold">Track:</span>{" "}
                    {tempTrack?.track.name}
                  </p>
                  <p>
                    <span className="font-bold">Popularity:</span>{" "}
                    {tempTrack?.track.popularity}
                  </p>
                  <p>
                    <span className="font-bold">XP:</span> {exp}
                  </p>
                </div>

                <div className="text-lg font-semibold">Level {userLevel}</div>
                <Progress
                  value={progress}
                  className="bg-white border [&>div]:bg-black transition-all duration-1000 ease-out"
                />

                <div className="text-sm text-gray-600">
                  {Math.round(progress)}% to next level
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={() => {
              window.location.reload();
            }}
            className="absolute -top-0.5 right-3 lg:top-10 lg:right-10 cursor-pointer"
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
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PacksPage;
