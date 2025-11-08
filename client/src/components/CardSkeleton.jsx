import React from "react";
import { motion } from "framer-motion";

const pulseTransition = {
  duration: 1.2,
  ease: "easeInOut",
  repeat: Infinity,
};

const CardSkeleton = () => {
  return (
    <div className="relative z-10 h-[370px] w-[270px] rounded-lg flex flex-col items-center justify-start bg-neutral-900 text-white p-4">
      {/* Album art placeholder */}
      <motion.div
        className="w-[200px] h-[200px] rounded-md bg-neutral-800"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={pulseTransition}
      />

      {/* Track name placeholder */}
      <motion.div
        className="mt-6 w-[180px] h-[20px] rounded-md bg-neutral-800"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={pulseTransition}
      />

      {/* Artist name placeholder */}
      <motion.div
        className="mt-3 w-[140px] h-[16px] rounded-md bg-neutral-800"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={pulseTransition}
      />
    </div>
  );
};

export default CardSkeleton;
