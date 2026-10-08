import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import AICore from "@/components/ai-interface/AICore";
import StatusIndicator from "@/components/ai-interface/StatusIndicator";
import FloatingPanel from "@/components/ai-interface/FloatingPanel";
import SystemLogs from "@/components/ai-interface/SystemLogs";
import AIMessages from "@/components/ai-interface/AIMessages";
import WaveformVisualizer from "@/components/ai-interface/WaveformVisualizer";
import ConnectorLines from "@/components/ai-interface/ConnectorLines";
import ConnectionStatus from "@/components/ai-interface/ConnectionStatus";
import BackgroundGrid from "@/components/ai-interface/BackgroundGrid";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";
import { useConversation } from "@/hooks/useConversation";

type AIStatus = "idle" | "listening" | "thinking" | "speaking";
type ActivePanel = "system-logs" | "ai-messages" | "voice-activity" | "connections" | null;

const Index = () => {
  const [status, setStatus] = useState<AIStatus>("idle");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const lastSpokenIndexRef = useRef<number>(-1);
  
  // Conversation hooks
  const { messages, isLoading, sendMessage, initializeSession } = useConversation();
  const { speak, stop: stopVoice } = useVoiceOutput();

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Handle voice input transcript
  const handleVoiceTranscript = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText) return;

      // Stop any ongoing speech output
      stopVoice();

      // Set to thinking while processing
      setStatus("thinking");

      try {
        await sendMessage(cleanText);
      } catch (error) {
        console.error("[L.N.X] Error sending voice message:", error);
        setStatus("idle");
      }
    },
    [sendMessage, stopVoice]
  );

  const { isListening, interimText, startListening, stopListening, submitAndStop } =
    useSpeechInput(handleVoiceTranscript);

  // Sync listening state with status without overwriting thinking/speaking
  useEffect(() => {
    if (isLoading) {
      setStatus("thinking");
    } else if (isListening && status !== "speaking" && status !== "thinking") {
      setStatus("listening");
    } else if (!isListening && status === "listening") {
      setStatus("idle");
    }
  }, [isListening, isLoading, status]);

  // Handle AI response with voice output (spoken exactly once per assistant message)
  useEffect(() => {
    const lastIndex = messages.length - 1;
    const lastMessage = messages[lastIndex];

    if (
      lastIndex >= 0 &&
      lastIndex > lastSpokenIndexRef.current &&
      lastMessage &&
      lastMessage.role === "assistant" &&
      !isLoading
    ) {
      lastSpokenIndexRef.current = lastIndex;

      // Ensure microphone is stopped during AI speaking
      stopListening();
      setStatus("speaking");

      speak(lastMessage.content)
        .then(() => {
          // Seamlessly transition back to listening for continuous conversation
          setStatus("listening");
          setTimeout(() => {
            startListening();
          }, 300);
        })
        .catch(() => {
          setStatus("idle");
        });
    }
  }, [messages, isLoading, speak, stopListening, startListening]);

  // Toggle voice interaction by clicking the AI core
  const toggleVoiceInteraction = useCallback(() => {
    if (isListening) {
      submitAndStop();
    } else if (status === "speaking") {
      stopVoice();
      startListening();
    } else {
      stopVoice();
      startListening();
    }
  }, [isListening, status, startListening, submitAndStop, stopVoice]);

  // Handle manual status change
  const handleStatusChange = useCallback(
    (newStatus: AIStatus) => {
      if (newStatus === "listening") {
        stopVoice();
        startListening();
      } else if (newStatus === "idle") {
        stopListening();
        stopVoice();
        setStatus("idle");
      } else {
        setStatus(newStatus);
      }
    },
    [startListening, stopListening, stopVoice]
  );

  return <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <BackgroundGrid />

      {/* Header */}
      <motion.header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.8
    }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-full" />
          <div>
            <h1 className="font-display text-xl tracking-[0.3em] text-primary text-glow">L.N.X</h1>
            <p className="sci-fi-label text-[10px] text-muted-foreground">ADVANCED  AGENT</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="sci-fi-label text-[10px]">v2.4.1</span>
          <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{
          opacity: [0.5, 1, 0.5]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <motion.nav className="fixed top-20 left-1/2 -translate-x-1/2 z-40 md:hidden flex gap-2 px-4 py-2 glass-panel rounded-full" initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.5
    }}>
        <button onClick={() => setActivePanel(activePanel === "system-logs" ? null : "system-logs")} className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-300 neon-button ${activePanel === "system-logs" ? "active" : ""}`}>
          System Logs
        </button>
        <button onClick={() => setActivePanel(activePanel === "voice-activity" ? null : "voice-activity")} className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-300 neon-button ${activePanel === "voice-activity" ? "active" : ""}`}>
          Voice Activity
        </button>
        <button onClick={() => setActivePanel(activePanel === "ai-messages" ? null : "ai-messages")} className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-300 neon-button ${activePanel === "ai-messages" ? "active" : ""}`}>
          AI Messages
        </button>
        <button onClick={() => setActivePanel(activePanel === "connections" ? null : "connections")} className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-300 neon-button ${activePanel === "connections" ? "active" : ""}`}>
          Connections
        </button>
      </motion.nav>

      {/* Main content */}
      <main className="relative flex items-center justify-center min-h-screen px-4">
        {/* Left panels - hidden on small screens */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 hidden md:flex">
          <FloatingPanel title="System Logs" side="left" delay={0.2}>
            <SystemLogs />
          </FloatingPanel>
          <FloatingPanel title="Voice Activity" side="left" delay={0.4}>
            <WaveformVisualizer isActive={status === "listening" || status === "speaking"} />
          </FloatingPanel>
        </div>

        {/* Connector lines - left */}
        <div className="absolute left-[320px] top-1/2 -translate-y-1/2 hidden lg:block">
          <ConnectorLines side="left" />
        </div>

        {/* Center - AI Core */}
        <div className="flex flex-col items-center gap-8">
          <AICore status={status} onClick={toggleVoiceInteraction} />
          <StatusIndicator status={status} interimText={interimText} onStatusChange={handleStatusChange} />
        </div>

        {/* Connector lines - right */}
        <div className="absolute right-[320px] top-1/2 -translate-y-1/2 hidden lg:block">
          <ConnectorLines side="right" />
        </div>

        {/* Right panels - hidden on small screens */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 hidden md:flex">
          <FloatingPanel title="AI Messages" side="right" delay={0.3}>
            <AIMessages messages={messages} onSendMessage={sendMessage} isLoading={isLoading} />
          </FloatingPanel>
          <FloatingPanel title="Connections" side="right" delay={0.5}>
            <ConnectionStatus />
          </FloatingPanel>
        </div>
      </main>

      {/* Mobile Panel Overlay */}
      {activePanel && (
        <motion.div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActivePanel(null)}
        >
          <motion.div
            className="absolute inset-4 glass-panel p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg tracking-[0.2em] text-primary text-glow uppercase">
                {activePanel === "system-logs" && "System Logs"}
                {activePanel === "voice-activity" && "Voice Activity"}
                {activePanel === "ai-messages" && "AI Messages"}
                {activePanel === "connections" && "Connections"}
              </h2>
              <button
                onClick={() => setActivePanel(null)}
                className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
              >
                <span className="text-primary text-sm">×</span>
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {activePanel === "system-logs" && <SystemLogs />}
              {activePanel === "voice-activity" && <WaveformVisualizer isActive={status === "listening" || status === "speaking"} />}
              {activePanel === "ai-messages" && <AIMessages messages={messages} onSendMessage={sendMessage} isLoading={isLoading} />}
              {activePanel === "connections" && <ConnectionStatus />}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer className="fixed bottom-0 left-0 right-0 flex items-center justify-center py-4" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1
    }}>
        <div className="flex items-center gap-6 text-muted-foreground">
          <span className="sci-fi-label text-[10px]">NEURAL LINK: STABLE</span>
          <div className="w-px h-4 bg-border" />
          <span className="sci-fi-label text-[10px]">LATENCY: 12MS</span>
          <div className="w-px h-4 bg-border" />
          <span className="sci-fi-label text-[10px]">UPTIME: 99.97%</span>
        </div>
      </motion.footer>
    </div>;
};
export default Index;