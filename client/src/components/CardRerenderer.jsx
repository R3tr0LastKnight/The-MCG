import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { FastAverageColor } from "fast-average-color";

const LiquidChrome = React.lazy(() => import("./ui/LiquidChrome"));
const Iridescence = React.lazy(() => import("./ui/Iridescence"));
const FaultyTerminal = React.lazy(() => import("./ui/FaultyTerminal"));
const Dither = React.lazy(() => import("./ui/Dither"));
const Silk = React.lazy(() => import("./ui/Silk"));

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

  const border = cardData?.data.border;
  const bgSubId = cardData?.data.bgSubId;

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

  const background = useMemo(() => {
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
      className="flex flex-col items-center justify-center gap-4 relative z-50  "
    >
      <div className="relative h-[390px] w-[290px] rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <Suspense fallback={null}>{background}</Suspense>
        </div>

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
            <div className="font-concent text-2xl line-clamp-2">
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
