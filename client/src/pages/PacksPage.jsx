import React, { useEffect, useRef, useState } from "react";
import Pack from "../components/Pack";
import * as htmlToImage from "html-to-image";
import { motion } from "framer-motion";
import Card from "../components/Card";

const PacksPage = () => {
  const [pack, setPack] = useState("");
  const [imgSrc, setImgSrc] = useState(null);
  const [showPack, setShowPack] = useState(true);
  const [colors, setColors] = useState({});
  const [burned, setBurned] = useState(false);
  const [getCard, setGetCard] = useState(false);
  const [packData, setPackData] = useState({
    bgColor: "",
    textColor: "",
    index: 0,
  });

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
              <Card pack={pack} getCard={getCard} imgSrc={imgSrc} />
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
    </div>
  );
};

export default PacksPage;
