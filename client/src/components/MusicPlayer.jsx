import { fetchTracks } from "../api/spotify";
import React, { useEffect, useState, useRef } from "react";

const MusicPlayer = () => {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Fetch tracks from backend on mount
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const data = await fetchTracks();
        setTracks(data);
        console.log("all tracks :", data);
      } catch (err) {
        console.error("Failed to fetch albums:", err.message);
      }
    };
    loadAlbums();
  }, []);

  // Play/pause effect
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const current = tracks[currentTrackIndex];
  console.log("track", current);

  const handlePlayPause = () => setIsPlaying((prev) => !prev);

  const handleNext = () =>
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);

  const handlePrev = () =>
    setCurrentTrackIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));

  if (!current) return null; // No tracks loaded yet

  return (
    <>
      <div className="flex lg:absolute lg:bottom-0 lg:right-0 lg:mx-12 lg:py-6">
        <div className="flex flex-row rounded-full items-center shadow-[0_3px_10px_rgb(0,0,0,0.2)] px-2 py-1 gap-2 w-36 lg:max-w-44 lg:w-44 overflow-hidden">
          {/* Album Art */}
          <div className="rounded-full overflow-hidden lg:w-1/4">
            <img
              src={current.cover}
              alt="cover"
              className="h-10 w-10 object-cover"
            />
          </div>

          {/* Title & Controls */}
          <div className="w-2/3">
            {/* Scrolling Title */}
            <div className="overflow-hidden whitespace-nowrap">
              <div className="flex w-max animate-marquee">
                <span className="mr-16">
                  {current.name} | {current.artist}
                </span>
                <span className="mr-16">
                  {current.name} | {current.artist}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-row w-full justify-evenly">
              {/* Prev */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={handlePrev}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z"
                />
              </svg>

              {/* Play/Pause */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={handlePlayPause}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z"
                />
              </svg>

              {/* Next */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={handleNext}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={current.preview} />
    </>
  );
};

export default MusicPlayer;
