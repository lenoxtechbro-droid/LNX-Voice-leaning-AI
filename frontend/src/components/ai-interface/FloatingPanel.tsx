import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingPanelProps {
  title: string;
  children: ReactNode;
  side: "left" | "right";
  delay?: number;
}

const FloatingPanel = ({ title, children, side, delay = 0 }: FloatingPanelProps) => {
  return (
    <motion.div
      className="glass-panel w-72 overflow-hidden"
      initial={{ 
        opacity: 0, 
        x: side === "left" ? -50 : 50,
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
      }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: "easeOut",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-primary/20 flex items-center gap-3">
        {/* Corner accent */}
        <div className="w-1 h-4 bg-primary rounded-full" />
        
        <h3 className="font-display text-sm tracking-[0.2em] text-primary text-glow uppercase">
          {title}
        </h3>

        {/* Status indicator */}
        <motion.div
          className="ml-auto w-2 h-2 rounded-full bg-accent"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {children}
      </div>

      {/* Footer decoration */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </motion.div>
  );
};

export default FloatingPanel;