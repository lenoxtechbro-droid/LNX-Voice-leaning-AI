import { motion } from "framer-motion";

interface Connection {
  name: string;
  status: "connected" | "pending" | "disconnected";
}

const ConnectionStatus = () => {
  const connections: Connection[] = [
    { name: "ELEVENLABS", status: "pending" },
    { name: "N8N BACKEND", status: "pending" },
    { name: "NEURAL NET", status: "connected" },
  ];

  const getStatusStyles = (status: Connection["status"]) => {
    switch (status) {
      case "connected":
        return { color: "hsl(120 100% 50%)", label: "ONLINE" };
      case "pending":
        return { color: "hsl(45 100% 50%)", label: "PENDING" };
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
            <span className="text-xs uppercase tracking-wider text-foreground/80">
              {connection.name}
            </span>
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusStyle.color }}
                animate={connection.status === "pending" ? {
                  opacity: [0.5, 1, 0.5],
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
              <span 
                className="text-[10px] uppercase tracking-wider"
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