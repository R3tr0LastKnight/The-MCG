import React, { useEffect, useState, useRef } from "react";

const MusicPlayer = () => {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Fetch tracks from backend on mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch(
          "https://the-mcg-server.vercel.app/api/spotify/random-tracks"
        );
        const data = await res.json();
        setTracks(data);
      } catch (err) {
        console.error("Failed to load tracks:", err);
      }
    };

    fetchTracks();
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
                onClick={handlePrev}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 cursor-pointer"
              >
                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
              </svg>

              {/* Play/Pause */}
              <svg
                onClick={handlePlayPause}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 cursor-pointer"
              >
                {isPlaying ? (
                  <path d="M15 6.75a.75.75 0 0 0-.75.75V18a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75H15ZM20.25 6.75a.75.75 0 0 0-.75.75V18c0 .414.336.75.75.75H21a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75h-.75Z" />
                ) : (
                  <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                )}
              </svg>

              {/* Next */}
              <svg
                onClick={handleNext}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 cursor-pointer"
              >
                <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
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
