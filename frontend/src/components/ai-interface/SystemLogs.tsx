import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warning" | "success" | "error";
  message: string;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, timestamp: "00:00:01", level: "info", message: "System initialized" },
    { id: 2, timestamp: "00:00:02", level: "success", message: "Neural network online" },
    { id: 3, timestamp: "00:00:03", level: "info", message: "Voice module ready" },
    { id: 4, timestamp: "00:00:04", level: "warning", message: "Awaiting API connection" },
    { id: 5, timestamp: "00:00:05", level: "info", message: "Backend sync pending" },
  ]);

  const getLevelStyles = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "text-primary";
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  // Simulate new logs
  useEffect(() => {
    const messages = [
      { level: "info" as const, message: "Processing audio stream" },
      { level: "success" as const, message: "Voice pattern recognized" },
      { level: "info" as const, message: "Generating response" },
      { level: "warning" as const, message: "High latency detected" },
      { level: "success" as const, message: "Response delivered" },
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      
      setLogs((prev) => [
        ...prev.slice(-6),
        {
          id: Date.now(),
          timestamp,
          level: randomMsg.level,
          message: randomMsg.message,
        },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2 font-mono text-xs">
      {logs.map((log, index) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex gap-2 items-start"
        >
          <span className="text-muted-foreground/50">[{log.timestamp}]</span>
          <span className={getLevelStyles(log.level)}>●</span>
          <span className="text-foreground/80">{log.message}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default SystemLogs;