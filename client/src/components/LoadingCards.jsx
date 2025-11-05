// components/LoadingCards.jsx
import { motion } from "framer-motion";

const shimmer = { x: ["-100%", "100%"] };
const shimmerTransition = {
  duration: 1.4,
  repeat: Infinity,
  ease: "easeInOut",
};

function SkeletonCard() {
  return (
    <div className="relative w-full flex justify-center">
      <div
        className="flex flex-col h-[410px] w-[300px] rounded-lg justify-center items-center gap-4
        bg-white/30 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.15)]
        border border-white/40 overflow-hidden relative"
      >
        {/* shimmer layer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={shimmer}
          transition={shimmerTransition}
        />

        {/* fake cover */}
        <div className="w-52 h-52 bg-neutral-300/60 rounded-lg" />

        {/* fake text */}
        <div className="w-40 h-6 bg-neutral-300/60 rounded-md" />
        <div className="w-28 h-5 bg-neutral-300/60 rounded-md" />
      </div>
    </div>
  );
}

export default function LoadingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
