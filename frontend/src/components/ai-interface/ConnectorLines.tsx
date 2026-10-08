import { motion } from "framer-motion";

interface ConnectorLinesProps {
  side: "left" | "right";
}

const ConnectorLines = ({ side }: ConnectorLinesProps) => {
  const isLeft = side === "left";

  return (
    <svg
      className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? "left-0 -translate-x-full" : "right-0 translate-x-full"}`}
      width="120"
      height="200"
      viewBox="0 0 120 200"
      style={{ transform: isLeft ? "translateX(-100%) translateY(-50%)" : "translateX(100%) translateY(-50%) scaleX(-1)" }}
    >
      {/* Main connector line */}
      <motion.path
        d="M 0 100 Q 40 100 60 60 L 120 60"
        fill="none"
        stroke="hsl(192 100% 50% / 0.4)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      
      {/* Secondary line */}
      <motion.path
        d="M 0 100 Q 40 100 60 140 L 120 140"
        fill="none"
        stroke="hsl(192 100% 50% / 0.3)"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.7 }}
      />

      {/* Animated data pulse on main line */}
      <motion.circle
        r="3"
        fill="hsl(192 100% 60%)"
        filter="drop-shadow(0 0 6px hsl(192 100% 50%))"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          delay: 1,
        }}
        style={{
          offsetPath: "path('M 0 100 Q 40 100 60 60 L 120 60')",
        }}
      />

      {/* Connection nodes */}
      <motion.circle
        cx="0"
        cy="100"
        r="4"
        fill="hsl(192 100% 50%)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      />
      
      <motion.circle
        cx="120"
        cy="60"
        r="3"
        fill="hsl(192 100% 50% / 0.6)"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 1.2, 1] }}
        transition={{ delay: 1.5, duration: 0.5 }}
      />
      
      <motion.circle
        cx="120"
        cy="140"
        r="3"
        fill="hsl(192 100% 50% / 0.6)"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 1.2, 1] }}
        transition={{ delay: 1.7, duration: 0.5 }}
      />
    </svg>
  );
};

export default ConnectorLines;