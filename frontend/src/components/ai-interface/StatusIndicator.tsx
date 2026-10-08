import { motion } from "framer-motion";

interface StatusIndicatorProps {
  status: "idle" | "listening" | "thinking" | "speaking";
  onStatusChange: (status: "idle" | "listening" | "thinking" | "speaking") => void;
}

const StatusIndicator = ({ status, onStatusChange }: StatusIndicatorProps) => {
  const statusConfig = {
    idle: {
      label: "STANDBY",
      color: "hsl(192 100% 50%)",
      description: "System Ready",
    },
    listening: {
      label: "LISTENING",
      color: "hsl(192 100% 60%)",
      description: "Voice Input Active",
    },
    thinking: {
      label: "PROCESSING",
      color: "hsl(45 100% 50%)",
      description: "Analyzing Data",
    },
    speaking: {
      label: "RESPONDING",
      color: "hsl(120 100% 50%)",
      description: "Audio Output",
    },
  };

  const currentStatus = statusConfig[status];
  const statuses: Array<"idle" | "listening" | "thinking" | "speaking"> = ["idle", "listening", "thinking", "speaking"];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status label */}
      <motion.div
        className="glass-panel px-6 py-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated dot */}
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: currentStatus.color }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Status text */}
        <div className="flex flex-col">
          <motion.span
            key={status}
            className="font-display text-lg tracking-wider text-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: currentStatus.color }}
          >
            {currentStatus.label}
          </motion.span>
          <span className="sci-fi-label text-[10px]">
            {currentStatus.description}
          </span>
        </div>
      </motion.div>

      {/* Status buttons for demo */}
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`px-3 py-1 text-xs uppercase tracking-wider rounded border transition-all duration-300 ${
              status === s
                ? "bg-primary/20 border-primary text-primary"
                : "border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusIndicator;