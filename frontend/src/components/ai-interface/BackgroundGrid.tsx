import { motion } from "framer-motion";

const BackgroundGrid = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, transparent 0%, hsl(222 47% 5%) 70%),
            radial-gradient(circle at 50% 50%, hsl(192 100% 50% / 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="hsl(192 100% 50% / 0.3)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Horizontal scan lines */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-primary"
            style={{ top: `${i * 2}%` }}
          />
        ))}
      </div>

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, hsl(192 100% 50% / 0.03), transparent)`,
        }}
        animate={{
          top: ["-20%", "120%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Corner decorations */}
      <svg className="absolute top-4 left-4 w-20 h-20 text-primary/30">
        <path d="M 0 20 L 0 0 L 20 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute top-4 right-4 w-20 h-20 text-primary/30">
        <path d="M 60 0 L 80 0 L 80 20" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-4 left-4 w-20 h-20 text-primary/30">
        <path d="M 0 60 L 0 80 L 20 80" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-20 h-20 text-primary/30">
        <path d="M 60 80 L 80 80 L 80 60" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default BackgroundGrid;