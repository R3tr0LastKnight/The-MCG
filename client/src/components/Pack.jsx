/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { fetchAllEnrichedAlbums } from "../api/spotify";
import { FastAverageColor } from "fast-average-color";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import LoadingCarousel from "./LoadingCarousel";

// import html2canvas from "html2canvas";

const Pack = ({
  pack,
  setPack,
  colors,
  setColors,
  imgSrc,
  setImgSrc,
  handleCapture,
  screenshotArea,
  packData,
  setPackData,
}) => {
  const [albums, setAlbums] = useState([]);

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
      img.src = album?.cover;
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
    onSwipedLeft: () => {
      if (!pack) handleNext();
    },
    onSwipedRight: () => {
      if (!pack) handlePrev();
    },
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

    // ⬇ If a pack is selected and this is NOT center → make it fall
    if (pack && position !== "center") {
      posStyles[position] = {
        ...posStyles[position],
        animate: { y: 800, opacity: 0, scale: 0.9 },
        transition: { duration: 0.5 },
      };
    }

    const current = posStyles[position];

    return (
      <motion.div
        key={albumIndex}
        className={` rounded-lg absolute cursor-target ${
          position !== "center" ? "pointer-events-none" : " "
        }`}
        style={{
          backgroundColor: colorSet.bgColor,
          color: colorSet.textColor,
          zIndex: current.zIndex,
        }}
        initial={current.initial}
        animate={
          current.animate ?? {
            x: current.x,
            y: current.y,
            scale: current.scale,
            opacity: current.opacity,
          }
        }
        exit={current.exit}
        transition={current.transition ?? { duration: 0.5 }}
        onClick={async () => {
          if (position === "center") {
            setPack({ album: album.album, artist: album.artist });
            setPackData((prev) => ({
              ...prev,
              bgColor: colorSet.bgColor,
              textColor: colorSet.textColor,
            }));
          }
        }}
      >
        <div
          ref={position === "center" ? screenshotArea : null}
          onDragStart={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col h-[400px] select-none w-[300px] rounded-lg justify-center items-center gap-4 shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
        >
          <div className="max-h-52 max-w-52 overflow-hidden ">
            <img
              src={album?.cover}
              alt={`${album.album} cover`}
              crossOrigin="anonymous"
              className="rounded"
            />
          </div>
          <div className="flex flex-col text-center">
            <h1 className="text-2xl font-bitcount px-2">{album?.album}</h1>
            <h2 className="text-base font-libertinus">{album?.artist}</h2>
            <a
              href={album?.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline mt-2 text-sm absolute bottom-1 right-3"
            >
              Open in Spotify
            </a>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      {...handlers}
      className="relative w-full h-full flex justify-center items-center overflow-hidden"
    >
      {!pack & (albums.length !== 0) ? (
        <div
          onClick={handlePrev}
          className="cursor-target absolute left-4 text-4xl z-40 select-none bg-black/50 text-white p-2 rounded-full hover:bg-black"
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
              d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
            />
          </svg>
        </div>
      ) : (
        <></>
      )}

      <div className="relative flex justify-center items-center w-[900px] h-[500px]">
        {albums.length === 0 ? (
          <>
            <LoadingCarousel />
          </>
        ) : (
          <AnimatePresence mode="popLayout" custom={direction}>
            {renderCard(getIndex(-1), "left")}
            {renderCard(getIndex(0), "center")}
            {renderCard(getIndex(1), "right")}
          </AnimatePresence>
        )}
      </div>
      {!pack & (albums.length !== 0) ? (
        <div
          onClick={handleNext}
          className="cursor-target absolute right-4 text-4xl z-40 select-none bg-black/50 text-white p-2 rounded-full hover:bg-black"
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
              d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Pack;
