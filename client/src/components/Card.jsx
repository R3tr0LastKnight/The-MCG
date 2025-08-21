import React, { useEffect, useRef, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { fetchRandomTrack } from "../api/spotify";

const Card = ({ pack, getCard }) => {
  const [colors, setColors] = useState({
    bgColor: "black",
    textColor: "white",
  });
  const imgRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 loading state

  // Fetch random track
  useEffect(() => {
    if (!pack) return;
    const controller = new AbortController();

    (async () => {
      try {
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
  }, []);

  // Extract color **only from this track’s image**
  const handleImageLoad = async () => {
    try {
      const fac = new FastAverageColor();
      const color = await fac.getColorAsync(imgRef.current);
      setColors({
        bgColor: color.rgb,
        textColor: color.isDark ? "white" : "black",
      });
    } catch (e) {
      console.error("Color extraction failed:", e);
    }
  };
  console.log(track);

  // Randomization stuff stays the same
  const CardRandomization = () => {
    const borderColors = [
      { class: "bg-yellow-400", chance: 10 },
      { class: "bg-gray-300", chance: 10 },
      { class: "bg-black ", chance: 10 },
      { class: "bg-white", chance: 10 },
      { class: "bg-gray-500", chance: 10 },
      { class: "holo-effect", chance: 10 },
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
      { class: "", chance: 33 },
      { class: "shiny-effect", chance: 33 },
      { class: "negative-effect", chance: 33 },
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

  const [{ borderClass, effectClass }] = useState(CardRandomization);

  return (
    <div className="flex flex-col items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-4">
      <div
        className={`flex flex-col h-[390px] w-[290px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] absolute border-4 ${borderClass} ${effectClass}`}
      >
        <div
          className="flex flex-col pt-8 items-center h-[370px] w-[270px] rounded-lg relative"
          style={{
            backgroundColor: colors.bgColor || "black",
            color: colors.textColor || "white",
          }}
        >
          {/* Show loader while fetching */}
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
                <div className="font-concent text-2xl">{track?.track.name}</div>
                <div className="font-semibold">{track?.album.name}</div>
                <div className="font-semibold">{track?.album.artist}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
