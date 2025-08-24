import React, { useEffect, useRef, useState, useMemo } from "react";
import { FastAverageColor } from "fast-average-color";
import { fetchRandomTrack } from "../api/spotify";
import LiquidChrome from "./ui/LiquidChrome";
import Iridescence from "./ui/Iridescence";
import FaultyTerminal from "./ui/FaultyTerminal";
import Dither from "./ui/Dither";
import Silk from "./ui/Silk";

const Card = ({ pack, getCard }) => {
  const [colors, setColors] = useState({
    bgColor: "black",
    textColor: "white",
  });
  const imgRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [border, setBorder] = useState(1);
  const [shaderColors, setShaderColors] = useState({
    waveColor: [0.5, 0.5, 0.5], // default fallback
    baseColor: [0.1, 0.1, 0.1], // default fallback
  });

  // Fetch random track
  useEffect(() => {
    if (!pack) return;
    const controller = new AbortController();

    (async () => {
      try {
        console.log("fetching data");

        const data = await fetchRandomTrack(pack, {
          signal: controller.signal,
        });
        setTrack(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch random track:", err.message);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [pack]);

  // Extract color **only from this track’s image**
  const handleImageLoad = async () => {
    try {
      const fac = new FastAverageColor();
      const color = await fac.getColorAsync(imgRef.current);

      setColors({
        bgColor: color.rgb,
        textColor: color.isDark ? "white" : "black",
      });

      // ✅ Convert to normalized [0..1] range for shader usage
      if (color.value && Array.isArray(color.value)) {
        // fac.value is usually [r,g,b,a]
        const [r, g, b] = color.value;
        const normalized = [(r ?? 0) / 255, (g ?? 0) / 255, (b ?? 0) / 255];

        setShaderColors({
          waveColor: normalized, // e.g. [0.5, 0.5, 0.5]
          baseColor: normalized, // another variable you can use elsewhere
        });
      }
    } catch (e) {
      console.error("Color extraction failed:", e);
    }
  };

  // Randomization stuff stays the same
  const CardRandomization = () => {
    const borderColors = [
      { class: "bg-gray-300", chance: 15 },
      { class: "bg-black ", chance: 20 },
      { class: "bg-white", chance: 15 },
      { class: "bg-gray-500", chance: 15 },
      { class: "holo-effect", chance: 5 },
      {
        class: "bg-gradient-to-tr from-gray-200 via-gray-50 to-gray-400",
        chance: 10,
      },
      {
        class:
          "bg-[conic-gradient(at_top_left,_#ff00ff,_#00ffff,_#ffff00,_#ff00ff)]",
        chance: 10,
      },
      {
        class:
          "bg-[linear-gradient(135deg,_#ff9ff3,_#feca57,_#48dbfb,_#1dd1a1,_#5f27cd,_#ff9ff3)] bg-[length:200%_200%] animate-gradient",
        chance: 10,
      },
    ];

    const effects = [
      { class: "", chance: 100 },
      { class: "shiny-effect", chance: 0 },
      { class: "negative-effect", chance: 0 },
    ];

    const pickRandomWeighted = (list) => {
      const total = list.reduce((sum, item) => sum + item.chance, 0);
      let rand = Math.random() * total;
      for (let item of list) {
        if (rand < item.chance) return item.class;
        rand -= item.chance;
      }
      return list[list.length - 1].class;
    };

    return {
      borderClass: pickRandomWeighted(borderColors),
      effectClass: pickRandomWeighted(effects),
    };
  };

  const pickBorder = () => {
    // Assign weights (chances) to each number
    const weights = [0.6, 0.1, 0.1, 0.1, 0.1];
    // (sum must be 1, here: 50%, 20%, 15%, 10%, 5%)

    const rnd = Math.random();
    let acc = 0;

    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (rnd <= acc) {
        setBorder(i + 1);
        break;
      }
    }
  };

  useEffect(() => {
    pickBorder();
  }, []);

  const [{ borderClass, effectClass }] = useState(CardRandomization);

  // ✅ Memoize background so it doesn’t remount on every render
  const background = useMemo(() => {
    if (border === 1) return null;
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
  }, [border]);

  const InnerCard = () => {
    return (
      <>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full w-full text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p className="mt-4">Loading track...</p>
          </div>
        ) : (
          <>
            <div className="flex h-[200px] w-[200px]">
              <img
                ref={imgRef}
                src={track?.album.image}
                alt={track?.album.name}
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex flex-col w-full px-10 py-2 font-libertinus">
              <div className="font-concent text-2xl line-clamp-2">
                {track?.track.name}
              </div>
              <div className="font-semibold">{track?.album.name}</div>
              <div className="font-semibold">{track?.album.artist}</div>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-4">
      <div className="relative h-[390px] w-[290px] rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] overflow-hidden">
        <div
          className={`absolute inset-0 -z-10 pointer-events-none ${borderClass} ${effectClass}`}
        >
          {background}
        </div>

        <div
          className="relative z-10 m-[10px] h-[370px] w-[270px] rounded-lg flex flex-col items-center justify-center transform-gpu will-change-transform"
          style={{
            backgroundColor: colors.bgColor || "black",
            color: colors.textColor || "white",
          }}
        >
          <InnerCard />
        </div>
      </div>
    </div>
  );
};

export default Card;
