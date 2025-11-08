import React, { useRef, useState, useMemo, Suspense } from "react";
import { FastAverageColor } from "fast-average-color";

import LiquidChrome from "./ui/LiquidChrome";
import Iridescence from "./ui/Iridescence";
import Dither from "./ui/Dither";
import Silk from "./ui/Silk";

const CardReRender = ({ cardData, type, ...props }) => {
  const imgRef = useRef(null);

  const [colors, setColors] = useState({
    bgColor: "black",
    textColor: "white",
  });

  const [shaderColors, setShaderColors] = useState({
    waveColor: [0.5, 0.5, 0.5],
    baseColor: [0.1, 0.1, 0.1],
  });

  const border = cardData?.data?.border;
  const bgSubId = cardData?.data?.bgSubId;

  // ✅ Map of 8 static border variations (used when border === 1)
  const staticBorders = {
    1: "bg-gray-300", // normal
    2: "bg-black", // rare
    3: "bg-white",
    4: "bg-gray-500", // epic
    5: "holo-effect", // holo
    6: "bg-gradient-to-tr from-gray-200 via-gray-50 to-gray-400",
    7: "bg-[conic-gradient(at_top_left,_#ff00ff,_#00ffff,_#ffff00,_#ff00ff)]",
    8: "bg-[linear-gradient(135deg,_#ff9ff3,_#feca57,_#48dbfb,_#1dd1a1,_#5f27cd,_#ff9ff3)] bg-[length:200%_200%] animate-gradient",
  };

  // ✅ Determine actual border class
  // If border=1 → use staticBorders[bgSubId], otherwise no static border
  const borderClass =
    border === 1 ? staticBorders[bgSubId] || "bg-gray-300" : "";

  const handleImageLoad = async () => {
    try {
      const fac = new FastAverageColor();
      const color = await fac.getColorAsync(imgRef.current);

      setColors({
        bgColor: color.rgb,
        textColor: color.isDark ? "white" : "black",
      });

      if (color.value && Array.isArray(color.value)) {
        const [r, g, b] = color.value;
        const normalized = [(r ?? 0) / 255, (g ?? 0) / 255, (b ?? 0) / 255];
        setShaderColors({
          waveColor: normalized,
          baseColor: normalized,
        });
      }
    } catch (e) {
      console.error("Color extraction failed:", e);
    }
  };

  // ✅ Animated borders (border > 1)
  const background = useMemo(() => {
    if (border === 1 || border === 0) return null;

    if (border === 2) {
      return (
        <LiquidChrome
          baseColor={shaderColors.waveColor}
          speed={1}
          amplitude={0.6}
          interactive={false}
        />
      );
    }
    if (border === 3) {
      return (
        <Iridescence
          key="iridescence"
          color={shaderColors.waveColor}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      );
    }
    if (border === 4) {
      return (
        <Dither
          waveColor={shaderColors.waveColor}
          disableAnimation={false}
          enableMouseInteraction={false}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      );
    }
    if (border === 5) {
      return (
        <Silk
          speed={5}
          scale={1}
          color="#7B7481"
          noiseIntensity={1.5}
          rotation={0}
        />
      );
    }
    return null;
  }, [border, shaderColors]);

  return (
    <div
      {...props}
      className="flex flex-col items-center justify-center gap-4 relative z-50 cursor-target"
    >
      {/* ✅ Shows static border when border=1, otherwise animated */}
      <div
        className={`relative h-[390px] w-[290px] rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] overflow-hidden ${borderClass}`}
      >
        {/* animated border layers */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <Suspense fallback={null}>{background}</Suspense>
        </div>

        {/* inner card */}
        <div
          className="relative z-10 m-[10px] h-[370px] w-[270px] rounded-lg flex flex-col items-center justify-center"
          style={{
            backgroundColor: colors.bgColor || "black",
            color: colors.textColor || "white",
          }}
        >
          <div className="flex h-[200px] w-[200px]">
            <img
              ref={imgRef}
              src={cardData?.track.album.image}
              alt={cardData?.track.album.name}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex flex-col w-full px-10 py-2 font-libertinus">
            <div className="font-cinzel font-semibold text-xl line-clamp-2">
              {cardData?.track.track.name}
            </div>
            <div className="font-semibold">{cardData?.track.album?.name}</div>
            <div className="font-semibold">{cardData?.track.album?.artist}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardReRender;
