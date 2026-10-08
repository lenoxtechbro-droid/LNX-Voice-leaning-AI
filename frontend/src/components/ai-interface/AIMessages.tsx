import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIMessagesProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const AIMessages = ({ messages, onSendMessage, isLoading }: AIMessagesProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] px-3 py-2 rounded text-sm ${
              message.role === "assistant"
                ? "bg-primary/10 border border-primary/20 text-foreground"
                : "bg-secondary/30 border border-secondary/40 text-foreground/90"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase tracking-wider ${
                message.role === "assistant" ? "text-primary" : "text-secondary-foreground"
              }`}>
                {message.role === "assistant" ? "L.N.X" : "USER"}
              </span>
            </div>
            <p className="leading-relaxed">{message.content}</p>
          </div>
        </motion.div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your message..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-input border border-border rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={inputValue.trim() === "" || isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-semibold uppercase tracking-[0.1em] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default AIMessages;