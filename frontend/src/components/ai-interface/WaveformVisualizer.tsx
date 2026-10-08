import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isActive: boolean;
}

const WaveformVisualizer = ({ isActive }: WaveformVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0.2));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(20).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(20).fill(0).map(() => 0.2 + Math.random() * 0.8));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400" : "bg-muted-foreground"}`}
          animate={isActive ? {
            scale: [1, 1.3, 1],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        />
        <span className="sci-fi-label text-[10px]">
          {isActive ? "VOICE ACTIVE" : "VOICE IDLE"}
        </span>
      </div>

      {/* Waveform bars */}
      <div className="flex items-center justify-center gap-1 h-16 px-2">
        {bars.map((height, index) => (
          <motion.div
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-primary to-primary/50"
            animate={{
              height: `${height * 100}%`,
            }}
            transition={{
              duration: 0.1,
              ease: "easeOut",
            }}
            style={{
              boxShadow: isActive ? "0 0 8px hsl(192 100% 50% / 0.5)" : "none",
            }}
          />
        ))}
      </div>

      {/* Audio level indicator */}
      <div className="flex items-center gap-2">
        <span className="sci-fi-label text-[10px]">LEVEL</span>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{
              width: isActive ? `${Math.random() * 60 + 20}%` : "10%",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
};

export default WaveformVisualizer;