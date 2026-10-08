import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type LogLevel = 'info' | 'warning' | 'success' | 'error';
export type LogCategory = 'MIC' | 'GROQ' | 'TTS' | 'SESSION' | 'NET';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category?: LogCategory;
  message: string;
}

interface SystemLogContextType {
  logs: LogEntry[];
  addLog: (message: string, level?: LogLevel, category?: LogCategory) => void;
  clearLogs: () => void;
}

const SystemLogContext = createContext<SystemLogContextType | undefined>(undefined);

const formatTime = (): string => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const SystemLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: formatTime(),
      level: 'info',
      category: 'SESSION',
      message: 'L.N.X Neural Engine initialized',
    },
    {
      id: 'init-2',
      timestamp: formatTime(),
      level: 'success',
      category: 'GROQ',
      message: 'Groq AI pipeline online (openai/gpt-oss-20b)',
    },
    {
      id: 'init-3',
      timestamp: formatTime(),
      level: 'info',
      category: 'MIC',
      message: 'Web Speech Recognition module standby',
    },
    {
      id: 'init-4',
      timestamp: formatTime(),
      level: 'success',
      category: 'TTS',
      message: 'Dual Voice Synthesis ready (ElevenLabs & WebSpeech)',
    },
  ]);

  const addLog = useCallback((message: string, level: LogLevel = 'info', category?: LogCategory) => {
    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: formatTime(),
      level,
      category,
      message,
    };

    setLogs((prev) => [...prev.slice(-35), newEntry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <SystemLogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </SystemLogContext.Provider>
  );
};

export const useSystemLogs = (): SystemLogContextType => {
  const context = useContext(SystemLogContext);
  if (!context) {
    throw new Error('useSystemLogs must be used within a SystemLogProvider');
  }
  return context;
};
