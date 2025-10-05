import React, { useState } from "react";
import { cn } from "../lib/utils.tsx";
import { DotPattern } from "../components/ui/dot-pattern.tsx";
import Drawer from "../components/Drawer.jsx";
import currents from "../assets/currents.png";
import Pack from "../components/Pack.jsx";
import CollectionPage from "./CollectionPage.jsx";
import PacksPage from "./PacksPage.jsx";
import AccountPage from "./AccountPage.jsx";
import StartingPage from "./StartingPage.jsx";
import MusicPlayer from "../components/MusicPlayer.jsx";
import TargetCursor from "../components/ui/TargetCursor.jsx";
// import PackOpening from "./PackOpening.jsx";

const IndexPage = () => {
  const [page, setPage] = useState("index");

  return (
    <>
      <TargetCursor spinDuration={2} hideDefaultCursor={true} />
      <div className="flex  py-4 lg:max-h-[86vh] lg:min-h-[86vh] max-h-[74vh] min-h-[74vh] relative">
        <div className="absolute z-40 hover:bg-black hover:text-white transition hidden lg:flex top-3 right-3 lg:top-2 lg:right-10   cursor-target border shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-lg bg-white px-2 py-2">
          Unstick Cursor
        </div>
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
