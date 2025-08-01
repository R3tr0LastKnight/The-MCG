import React from "react";
import { cn } from "../lib/utils.tsx";
import { DotPattern } from "../components/ui/dot-pattern.tsx";
import Drawer from "../components/Drawer.jsx";
import currents from "../assets/currents.png";
import Pack from "../components/Pack.jsx";

const IndexPage = () => {
  return (
    <div className="flex  py-4 lg:max-h-[86vh] lg:min-h-[86vh] max-h-[74vh] min-h-[74vh] relative">
      <DotPattern
        glow={false}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,black,transparent)]"
        )}
      />
      <Drawer />
      <div className="flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
        <Pack />
      </div>
    </div>
  );
};

export default IndexPage;
