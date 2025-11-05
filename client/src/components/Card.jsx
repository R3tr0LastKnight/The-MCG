import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { FastAverageColor } from "fast-average-color";
import { fetchRandomTrack } from "../api/spotify";

const LiquidChrome = React.lazy(() => import("./ui/LiquidChrome"));
const Iridescence = React.lazy(() => import("./ui/Iridescence"));
const Dither = React.lazy(() => import("./ui/Dither"));
const Silk = React.lazy(() => import("./ui/Silk"));

const Card = ({
  pack,
  setTempTrack,
  setShowChoose,
  keep,
  setKeep,
  setExp,
  track: passedTrack,
  cardData: passedCardData,
  cardData2,
  setCardData2,
  ...props
}) => {
  const [colors, setColors] = useState({
    bgColor: "black",
    textColor: "white",
  });
  const imgRef = useRef(null);
  const [track, setTrack] = useState(passedTrack || null);
  const [loading, setLoading] = useState(!passedTrack);
  const [border, setBorder] = useState(1);
  const [shaderColors, setShaderColors] = useState({
    waveColor: [0.5, 0.5, 0.5],
    baseColor: [0.1, 0.1, 0.1],
  });
  const [cardData, setCardData] = useState({});
  const [borderXp, setBorderXp] = useState(0);

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

  const CardRandomization = () => {
    const borderColors = [
      { class: "bg-gray-300", chance: 15, bgSubId: 1, bxp: 10 },
      { class: "bg-black", chance: 20, bgSubId: 2, bxp: 15 },
      { class: "bg-white", chance: 15, bgSubId: 3, bxp: 5 },
      { class: "bg-gray-500", chance: 15, bgSubId: 4, bxp: 5 },
      { class: "holo-effect", chance: 5, bgSubId: 5, bxp: 20 },
      {
        class: "bg-gradient-to-tr from-gray-200 via-gray-50 to-gray-400",
        chance: 10,
        bgSubId: 6,
        bxp: 15,
      },
      {
        class:
          "bg-[conic-gradient(at_top_left,_#ff00ff,_#00ffff,_#ffff00,_#ff00ff)]",
        chance: 10,
        bgSubId: 7,
        bxp: 15,
      },
      {
        class:
          "bg-[linear-gradient(135deg,_#ff9ff3,_#feca57,_#48dbfb,_#1dd1a1,_#5f27cd,_#ff9ff3)] bg-[length:200%_200%] animate-gradient",
        chance: 10,
        bgSubId: 8,
        bxp: 15,
      },
    ];

    const effects = [
      { class: "", chance: 95, effectId: 1, exp: 10 },
      { class: "shiny-effect", chance: 0, effectId: 2 },
      { class: "negative-effect", chance: 5, effectId: 3, exp: 25 },
    ];

    const pickRandomWeighted = (list) => {
      const total = list.reduce((sum, item) => sum + item.chance, 0);
      let rand = Math.random() * total;
      for (let item of list) {
        if (rand < item.chance) return item;
        rand -= item.chance;
      }
      return list[list.length - 1];
    };

    const borderPick = pickRandomWeighted(borderColors);
    const effectPick = pickRandomWeighted(effects);

    return {
      borderClass: borderPick.class,
      bgSubId: borderPick.bgSubId,
      bxp: borderPick.bxp,
      effectClass: effectPick.class,
      effectId: effectPick.effectId,
      exp: effectPick.exp || 0,
    };
  };

  useEffect(() => {
    if (!passedCardData) {
      pickBorder();
    } else setBorder(passedCardData.border);
  }, [passedCardData]);

  const pickBorder = () => {
    const weights = [0.6, 0.1, 0.1, 0.1, 0.1];
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

  // ✅ properly store randomized border values
  const [{ borderClass, effectClass, bgSubId, effectId, exp, bxp }] =
    useState(CardRandomization);

  // ✅ prevent re-creating shaderColors every frame
  const shaderRef = useRef(shaderColors);
  useEffect(() => {
    shaderRef.current = shaderColors;
  }, [shaderColors]);

  useEffect(() => {
    if (track) {
      const data = {
        trackId: track.track.id,
        albumId: track.album.id,
        border,
        bgSubId,
        effectId,
      };
      setCardData(data);
      setCardData2({ track, data });
      setExp(Math.round(borderXp + exp + bxp + track?.track.popularity / 3));
      setShowChoose(true);
    }
  }, [track, border, borderClass, effectClass, bgSubId, effectId]);

  useEffect(() => {
    if (!pack || passedTrack) {
      setTrack(passedTrack);
      setBorder(passedTrack?.border);
      if (passedTrack) {
        const preparedData = {
          trackId: passedTrack.track?.id,
          albumId: passedTrack.album?.id,
          border: passedTrack.border ?? border,
          bgSubId,
          effectId,
        };
        setCardData(preparedData);
        setTempTrack(passedTrack, preparedData); // pass both
      }
    } else {
      const controller = new AbortController();

      (async () => {
        try {
          const data = await fetchRandomTrack(pack, {
            signal: controller.signal,
          });

          const preparedData = {
            trackId: data.track?.id,
            albumId: data.album?.id,
            border,
            bgSubId,
            effectId,
          };

          setTrack(data);
          setCardData(preparedData);
          setTempTrack(data, preparedData); // ✅ pass both track + cardData
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Failed to fetch random track:", err.message);
          }
        } finally {
          setLoading(false);
        }
      })();

      return () => controller.abort();
    }
  }, [pack, passedTrack, border, bgSubId, effectId]);

  // ✅ fixed background (no flicker)
  const background = useMemo(() => {
    const shader = shaderRef.current;

    if (border === 1) return null;
    if (border === 2) {
      setBorderXp(30);
      return (
        <LiquidChrome
          baseColor={shader.waveColor}
          speed={1}
          amplitude={0.6}
          interactive={false}
        />
      );
    }
    if (border === 3) {
      setBorderXp(25);
      return (
        <Iridescence
          key="iridescence"
          color={shader.waveColor}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      );
    }
    if (border === 4) {
      setBorderXp(20);
      return (
        <Dither
          waveColor={shader.waveColor}
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
      setBorderXp(15);
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
            <div className="flex flex-col w-full px-10 py-2 ">
              <div className="font-concent font- text-2xl line-clamp-2">
                {track?.track.name}
              </div>
              <div className="font-medium">{track?.album.name}</div>
              <div className="font-medium">{track?.album.artist}</div>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div
      {...props}
      className={`flex flex-col items-center justify-center ${
        keep === 2
          ? ""
          : "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      }  gap-4`}
    >
      <div
        className={`relative h-[390px] w-[290px] rounded-lg overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.2)] ${
          border === 1 ? borderClass || "" : ""
        }`}
      >
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <Suspense fallback={null}>{background}</Suspense>
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
