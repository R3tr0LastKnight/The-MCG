import React, { useEffect, useState } from "react";
import { fetchAllEnrichedAlbums } from "../api/spotify";
import { FastAverageColor } from "fast-average-color";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";

const Pack = () => {
  const [albums, setAlbums] = useState([]);
  const [colors, setColors] = useState({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1=next, -1=prev

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const data = await fetchAllEnrichedAlbums();
        setAlbums(data);
      } catch (err) {
        console.error("Failed to fetch albums:", err.message);
      }
    };
    loadAlbums();
  }, []);

  useEffect(() => {
    const fac = new FastAverageColor();
    albums.forEach((album, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = album.cover;
      img.onload = async () => {
        try {
          const color = await fac.getColorAsync(img);
          setColors((prev) => ({
            ...prev,
            [i]: {
              bgColor: color.rgb,
              textColor: color.isDark ? "white" : "black",
            },
          }));
        } catch (e) {
          console.error("Color extraction failed:", e);
        }
      };
    });
  }, [albums]);

  const total = albums.length;
  const getIndex = (offset) => (index + offset + total) % total;

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + total) % total);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const renderCard = (albumIndex, position) => {
    const album = albums[albumIndex];
    const colorSet = colors[albumIndex] || {
      bgColor: "black",
      textColor: "white",
    };

    const posStyles = {
      left: {
        x: -250,
        y: 60,
        scale: 0.88,
        zIndex: 10,
        opacity: 0.9,
        initial: { x: -100, y: 300, opacity: 0.2, scale: 0.6 },
        exit: { x: -100, y: 300, opacity: 0, scale: 0.8 },
      },
      center: {
        x: 0,
        y: 0,
        scale: 1,
        zIndex: 30,
        opacity: 1,
        initial: { opacity: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
      },
      right: {
        x: 250,
        y: 60,
        scale: 0.88,
        zIndex: 10,
        opacity: 0.9,
        initial: { x: 100, y: 300, opacity: 0.2, scale: 0.6 },
        exit: { x: 100, y: 300, opacity: 0, scale: 0.8 },
      },
    };

    const current = posStyles[position];

    return (
      <motion.div
        key={albumIndex}
        className={`flex flex-col h-[400px] w-[300px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)] absolute ${
          position !== "center" ? "pointer-events-none" : "cursor-pointer"
        }`}
        style={{
          backgroundColor: colorSet.bgColor,
          color: colorSet.textColor,
          zIndex: current.zIndex,
        }}
        initial={current.initial}
        animate={{
          x: current.x,
          y: current.y,
          scale: current.scale,
          opacity: current.opacity,
        }}
        exit={current.exit}
        transition={{ duration: 0.5 }}
        onClick={() => {
          if (position === "center") {
            console.log("Clicked center pack:", album.album);
            // perform action like routing or opening modal
          }
        }}
      >
        <div className="max-h-52 max-w-52 overflow-hidden">
          <img
            src={album.cover}
            alt={`${album.album} cover`}
            crossOrigin="anonymous"
            className="rounded"
          />
        </div>
        <div className="flex flex-col text-center">
          <h1 className="text-3xl font-concent">{album.album}</h1>
          <h2 className="text-lg font-libertinus">{album.artist}</h2>
          <a
            href={album.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline mt-2 text-sm absolute bottom-1 right-3"
          >
            Open in Spotify
          </a>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      {...handlers}
      className="relative w-full h-full flex justify-center items-center overflow-hidden"
    >
      <button
        onClick={handleNext}
        className="absolute left-4 text-4xl z-40 select-none bg-black/50 text-white p-2 rounded-full hover:bg-black"
      >
        &#x276E;
      </button>

      <div className="relative flex justify-center items-center w-[900px] h-[500px]">
        {albums.length === 0 ? (
          <div>Loading albums...</div>
        ) : (
          <AnimatePresence mode="popLayout" custom={direction}>
            {renderCard(getIndex(-1), "left")}
            {renderCard(getIndex(0), "center")}
            {renderCard(getIndex(1), "right")}
          </AnimatePresence>
        )}
      </div>

      <button
        onClick={handlePrev}
        className="absolute right-4 text-4xl z-40 select-none bg-black/50 text-white p-2 rounded-full hover:bg-black"
      >
        &#x276F;
      </button>
    </div>
  );
};

export default Pack;
