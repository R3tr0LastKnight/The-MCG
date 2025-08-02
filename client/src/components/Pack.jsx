import React, { useEffect, useRef, useState } from "react";
import { fetchSpotifyToken, searchAlbumByName } from "../api/spotify";
import { FastAverageColor } from "fast-average-color";

const Pack = () => {
  const [artist, setArtist] = useState("Joji");
  const [album, setAlbum] = useState("Smithereens");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const imgRef = useRef(null);
  const [bgColor, setBgColor] = useState("black");
  const [textColor, setTextColor] = useState("white");

  const handleSearch = async () => {
    setError("");
    try {
      const data = await searchAlbumByName(artist, album);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch album on mount
  useEffect(() => {
    handleSearch();
  }, []);

  // Recalculate background + text color when image loads
  useEffect(() => {
    if (!result?.cover) return;

    const fac = new FastAverageColor();
    const img = imgRef.current;

    const updateColor = async () => {
      try {
        const result = await fac.getColorAsync(img);
        setBgColor(result.rgb);
        setTextColor(result.isDark ? "white" : "black");
      } catch (e) {
        console.error("Color extraction failed:", e);
      }
    };

    if (img && img.complete) {
      updateColor();
    } else {
      img?.addEventListener("load", updateColor);
      return () => img?.removeEventListener("load", updateColor);
    }
  }, [result]);

  return (
    <div
      className="flex flex-col h-[400px] w-[300px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        transition: "background-color 0.4s ease",
      }}
    >
      <div className="max-h-52 max-w-52 overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
        {result?.cover && (
          <img
            ref={imgRef}
            src={result.cover}
            alt={`${album} cover`}
            crossOrigin="anonymous"
            className="rounded"
          />
        )}
      </div>

      <div className="flex flex-col text-center">
        <h1 className="text-5xl font-concent" style={{ color: textColor }}>
          {artist}
        </h1>
        <h2 className="text-lg font-libertinus" style={{ color: textColor }}>
          Pack
        </h2>
      </div>
    </div>
  );
};

export default Pack;
