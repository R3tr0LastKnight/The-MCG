import React, { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

const PackReRenderer = ({ packData }) => {
  const [bgColor, setBgColor] = useState("rgb(30,30,30)");
  const [textColor, setTextColor] = useState("white");

  useEffect(() => {
    if (!packData?.cover) return;
    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = packData.cover;

    img.onload = async () => {
      try {
        const color = await fac.getColorAsync(img);
        setBgColor(color.rgb);
        setTextColor(color.isDark ? "white" : "black");
      } catch (err) {
        console.error("Color extraction failed:", err);
      }
    };
  }, [packData?.cover]);

  return (
    <div
      className="flex cursor-target flex-col h-[400px] select-none w-[300px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] transition-all duration-500 hover:scale-[1.03]"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="max-h-52 max-w-52 overflow-hidden">
        <img
          src={packData?.cover}
          alt={`${packData?.album} cover`}
          crossOrigin="anonymous"
          className="rounded"
        />
      </div>

      <div className="flex flex-col text-center relative">
        <h1 className="text-3xl font-concent px-2 line-clamp-2">
          {packData?.album}
        </h1>
        <h2 className="text-lg font-libertinus">{packData?.artist}</h2>
      </div>
    </div>
  );
};

export default PackReRenderer;
