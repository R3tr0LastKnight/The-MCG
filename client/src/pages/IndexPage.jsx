import React, { lazy, useState } from "react";
import { cn } from "../lib/utils.tsx";
import { DotPattern } from "../components/ui/dot-pattern.tsx";
import { useEffect } from "react";
import { fetchUserCount } from "../api/spotify.js";
import Drawer from "../components/Drawer.jsx";
import Counter from "../components/ui/Counter.jsx";
import TargetCursor from "../components/ui/TargetCursor.jsx";
import CollectionPage from "./CollectionPage.jsx";
import PacksPage from "./PacksPage.jsx";
import AccountPage from "./AccountPage.jsx";
import StartingPage from "./StartingPage.jsx";
import LeaderboardPage from "./LeaderboardPage.jsx";

const IndexPage = () => {
  const [page, setPage] = useState("index");
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const count = await fetchUserCount();
        setUserCount(count);
      } catch (err) {
        console.error("Error fetching user count:", err);
      }
    };

    loadCount();
  }, []);

  return (
    <>
      <TargetCursor spinDuration={2} hideDefaultCursor={true} />
      <div className="flex  py-4 lg:max-h-[86vh] lg:min-h-[86vh] max-h-[79vh] min-h-[79vh] relative">
        <div className="absolute items-center justify-center ms z-40 transition gap-1 flex top-3 right-3 lg:top-2 lg:right-10   cursor-target border shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-white px-2 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4"
          >
            <path d="M15.75 8.25a.75.75 0 0 1 .75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 1 1-.992-1.124A2.243 2.243 0 0 0 15 9a.75.75 0 0 1 .75-.75Z" />
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM4.575 15.6a8.25 8.25 0 0 0 9.348 4.425 1.966 1.966 0 0 0-1.84-1.275.983.983 0 0 1-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 0 1 2.328-.377L16.5 15h.628a2.25 2.25 0 0 1 1.983 1.186 8.25 8.25 0 0 0-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.575 15.6Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="font-semibold">Population : </div>
          <div className="rounded-lg overflow-hidden flex items-center justify-center">
            <Counter
              value={userCount}
              places={[1000, 100, 10, 1]}
              fontSize={20}
              padding={5}
              gap={10}
              textColor="black"
              fontWeight={600}
            />
          </div>
        </div>
        {/* <div className="absolute z-40 hover:bg-black hover:text-white transition hidden lg:flex bottom-3 right-3 lg:bottom-2 lg:right-10   cursor-target border shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-white px-2 py-2">
          Unstick Cursor
        </div> */}
        <DotPattern
          glow={false}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,black,transparent)]"
          )}
        />
        <Drawer page={page} setPage={setPage} />
        {/* <div className="hidden lg:flex">
        <MusicPlayer />
      </div> */}
        {page === "index" ? (
          <StartingPage />
        ) : page === "collection" ? (
          <>
            <CollectionPage page={page} />
          </>
        ) : page === "packs" ? (
          <>
            <PacksPage />
          </>
        ) : page === "account" ? (
          <>
            <AccountPage />
          </>
        ) : page === "leaderboard" ? (
          <>
            <LeaderboardPage />
          </>
        ) : page === "logout" ? (
          <></>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default IndexPage;
