// LoadingCarousel.jsx
import { motion } from "framer-motion";

const shimmer = {
  x: ["-100%", "100%"],
};
const shimmerTransition = {
  duration: 1.4,
  repeat: Infinity,
  ease: "easeInOut",
};

const Skeleton = ({ x, y, scale, opacity, zIndex }) => (
  <motion.div
    className="absolute"
    style={{ x, y, scale, opacity, zIndex }}
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity, scale }}
    transition={{ duration: 0.5 }}
  >
    <div
      className="flex flex-col h-[400px] w-[300px] rounded-lg justify-center items-center gap-4
      bg-white/30 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.15)]
      border border-white/40 overflow-hidden relative"
    >
      {/* shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={shimmer}
        transition={shimmerTransition}
      />

      {/* fake cover */}
      <div className="w-52 h-52 bg-neutral-400/60 rounded-lg" />

      {/* fake title */}
      <div className="w-40 h-6 bg-neutral-400/60 rounded-md" />
      {/* fake artist */}
      <div className="w-28 h-5 bg-neutral-400/60 rounded-md" />
    </div>
  </motion.div>
);

export default function LoadingCarousel() {
  return (
    <div className="relative flex justify-center items-center w-[900px] h-[500px]">
      {/* left card */}
      <Skeleton x={-250} y={60} scale={0.88} opacity={0.85} zIndex={10} />

      {/* center card */}
      <Skeleton x={0} y={0} scale={1} opacity={1} zIndex={30} />

      {/* right card */}
      <Skeleton x={250} y={60} scale={0.88} opacity={0.85} zIndex={10} />
    </div>
  );
}
