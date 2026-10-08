import { motion } from "framer-motion";

interface Connection {
  name: string;
  sublabel?: string;
  status: "connected" | "pending" | "disconnected" | "fallback";
}

const ConnectionStatus = () => {
  const connections: Connection[] = [
    { name: "GROQ AI", sublabel: "openai/gpt-oss-20b", status: "connected" },
    { name: "FASTAPI BACKEND", sublabel: "127.0.0.1:8000", status: "connected" },
    { name: "WEBSPEECH API", sublabel: "Browser Engine", status: "connected" },
    { name: "ELEVENLABS TTS", sublabel: "Browser Fallback", status: "fallback" },
  ];

  const getStatusStyles = (status: Connection["status"]) => {
    switch (status) {
      case "connected":
        return { color: "hsl(142 76% 50%)", label: "ONLINE" };
      case "fallback":
        return { color: "hsl(192 100% 50%)", label: "NEURAL TTS" };
      case "pending":
        return { color: "hsl(45 100% 50%)", label: "STANDBY" };
      case "disconnected":
        return { color: "hsl(0 85% 55%)", label: "OFFLINE" };
    }
  };

  return (
    <div className="space-y-3">
      {connections.map((connection, index) => {
        const statusStyle = getStatusStyles(connection.status);
        return (
          <motion.div
            key={connection.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between py-2 px-3 rounded bg-muted/30 border border-muted/50"
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-foreground font-semibold">
                {connection.name}
              </span>
              {connection.sublabel && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {connection.sublabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusStyle.color }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <span
                className="text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: statusStyle.color }}
              >
                {statusStyle.label}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ConnectionStatus;