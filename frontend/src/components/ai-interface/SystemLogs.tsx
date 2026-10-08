import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSystemLogs, LogLevel, LogCategory } from "@/contexts/SystemLogContext";
import { Trash2 } from "lucide-react";

const SystemLogs = () => {
  const { logs, clearLogs } = useSystemLogs();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLevelStyles = (level: LogLevel) => {
    switch (level) {
      case "info":
        return "text-cyan-400";
      case "success":
        return "text-emerald-400";
      case "warning":
        return "text-amber-400";
      case "error":
        return "text-rose-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getCategoryStyles = (category?: LogCategory) => {
    switch (category) {
      case "MIC":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "GROQ":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "TTS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "SESSION":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "NET":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-muted/30 text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[300px]">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="sci-fi-label text-[10px] text-muted-foreground">LIVE STREAM</span>
        </div>
        <button
          onClick={clearLogs}
          title="Clear system logs"
          className="text-muted-foreground/60 hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Logs container */}
      <div ref={scrollContainerRef} className="space-y-2 font-mono text-xs overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
        {logs.length === 0 ? (
          <div className="text-muted-foreground/50 italic py-4 text-center text-[11px]">
            No activity logged yet...
          </div>
        ) : (
          logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-start leading-tight"
            >
              <span className="text-muted-foreground/50 text-[10px] whitespace-nowrap pt-0.5">
                [{log.timestamp}]
              </span>

              {log.category && (
                <span
                  className={`text-[9px] px-1 py-0.5 rounded border whitespace-nowrap font-bold tracking-wider ${getCategoryStyles(
                    log.category
                  )}`}
                >
                  {log.category}
                </span>
              )}

              <span className={`${getLevelStyles(log.level)} pt-0.5`}>●</span>

              <span className="text-foreground/90 break-words flex-1 text-[11px]">
                {log.message}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SystemLogs;