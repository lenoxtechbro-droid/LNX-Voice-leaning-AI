import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface AICoreProps {
  status: "idle" | "listening" | "thinking" | "speaking";
}

const AICore = ({ status }: AICoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animations for the movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  // Transform mouse position to rotation and translation
  const rotateX = useTransform(smoothY, [-200, 200], [15, -15]);
  const rotateY = useTransform(smoothX, [-200, 200], [-15, 15]);
  const translateX = useTransform(smoothX, [-200, 200], [-20, 20]);
  const translateY = useTransform(smoothY, [-200, 200], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const getStatusColor = () => {
    switch (status) {
      case "listening":
        return "hsl(192 100% 50%)";
      case "thinking":
        return "hsl(45 100% 50%)";
      case "speaking":
        return "hsl(120 100% 50%)";
      default:
        return "hsl(192 100% 50%)";
    }
  };

  const ringData = [
    { size: 320, duration: 20, direction: 1, segments: 12, opacity: 0.3 },
    { size: 280, duration: 15, direction: -1, segments: 8, opacity: 0.4 },
    { size: 240, duration: 12, direction: 1, segments: 16, opacity: 0.5 },
    { size: 200, duration: 18, direction: -1, segments: 6, opacity: 0.6 },
    { size: 160, duration: 10, direction: 1, segments: 24, opacity: 0.7 },
  ];

  return (
    <motion.div 
      ref={containerRef}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          transformStyle: "preserve-3d",
        }}
        className="relative flex items-center justify-center"
      >
        {/* Outer glow backdrop */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: getStatusColor() }}
        />

        {/* Rotating rings */}
        {ringData.map((ring, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full border"
            style={{
              width: ring.size,
              height: ring.size,
              borderColor: `hsl(192 100% 50% / ${ring.opacity})`,
              borderWidth: index % 2 === 0 ? 2 : 1,
            }}
            animate={{ rotate: ring.direction * 360 }}
            transition={{
              duration: ring.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
          >
            {/* Segment markers */}
            {Array.from({ length: ring.segments }).map((_, segIndex) => (
              <div
                key={segIndex}
                className="absolute w-1 h-3 bg-primary rounded-full"
                style={{
                  left: "50%",
                  top: 0,
                  transform: `translateX(-50%) rotate(${(360 / ring.segments) * segIndex}deg)`,
                  transformOrigin: `50% ${ring.size / 2}px`,
                  opacity: ring.opacity,
                }}
              />
            ))}
          </motion.div>
        ))}

        {/* Inner decorative ring with dashes */}
        <motion.svg
          className="absolute"
          width="130"
          height="130"
          viewBox="0 0 130 130"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="65"
            cy="65"
            r="60"
            fill="none"
            stroke="hsl(192 100% 50% / 0.5)"
            strokeWidth="2"
            strokeDasharray="10 5"
          />
        </motion.svg>

        {/* Core container */}
        <motion.div
          className="relative w-28 h-28 rounded-full flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Core glow layers */}
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-60"
            style={{ backgroundColor: getStatusColor() }}
          />
          <div 
            className="absolute inset-2 rounded-full blur-lg opacity-80"
            style={{ backgroundColor: getStatusColor() }}
          />
          
          {/* Core inner */}
          <motion.div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 30% 30%, hsl(192 100% 70%), hsl(210 100% 40%))`,
              boxShadow: `
                0 0 30px hsl(192 100% 50% / 0.8),
                0 0 60px hsl(192 100% 50% / 0.5),
                inset 0 0 30px hsl(210 100% 30% / 0.5)
              `,
            }}
            animate={{
              boxShadow: [
                `0 0 30px hsl(192 100% 50% / 0.8), 0 0 60px hsl(192 100% 50% / 0.5), inset 0 0 30px hsl(210 100% 30% / 0.5)`,
                `0 0 50px hsl(192 100% 50% / 1), 0 0 80px hsl(192 100% 50% / 0.7), inset 0 0 40px hsl(210 100% 30% / 0.7)`,
                `0 0 30px hsl(192 100% 50% / 0.8), 0 0 60px hsl(192 100% 50% / 0.5), inset 0 0 30px hsl(210 100% 30% / 0.5)`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* L.N.X text */}
            <span 
              className="font-display text-lg tracking-[0.2em] text-primary-foreground text-glow select-none"
              style={{
                textShadow: "0 0 10px hsl(192 100% 70%), 0 0 20px hsl(192 100% 50%)"
              }}
            >
              L.N.X
            </span>
          </motion.div>
        </motion.div>

        {/* Red accent markers */}
        {[0, 90, 180, 270].map((angle) => (
          <motion.div
            key={angle}
            className="absolute w-2 h-2 bg-accent rounded-full"
            style={{
              transform: `rotate(${angle}deg) translateY(-170px)`,
              boxShadow: "0 0 10px hsl(0 85% 55% / 0.8)",
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: angle / 360,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AICore;
