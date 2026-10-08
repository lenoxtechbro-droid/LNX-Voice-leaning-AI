import { useState, useCallback, useRef } from 'react';
import { useSystemLogs } from '@/contexts/SystemLogContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseConversationReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  sessionId: string | null;
  initializeSession: () => Promise<void>;
}

export const useConversation = (): UseConversationReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isInitializingRef = useRef<boolean>(false);
  const { addLog } = useSystemLogs();

  // Helper to create or reuse session ID
  const getOrCreateSession = useCallback(async (): Promise<string> => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    try {
      addLog('Negotiating session with backend...', 'info', 'SESSION');
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'New conversation' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.session_id) {
          sessionIdRef.current = data.session_id;
          setSessionId(data.session_id);
          addLog(`Session created: ${data.session_id.slice(0, 8)}... (HTTP 200)`, 'success', 'SESSION');
          return data.session_id;
        }
      } else {
        addLog(`Session API returned status ${response.status}`, 'warning', 'NET');
      }
    } catch (e) {
      console.warn('[L.N.X Conversation] Backend session start warning, using local session ID:', e);
      addLog('Backend offline, generated local session token', 'warning', 'SESSION');
    }

    const fallbackId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}`;
    sessionIdRef.current = fallbackId;
    setSessionId(fallbackId);
    return fallbackId;
  }, [addLog]);

  const initializeSession = useCallback(async () => {
    if (isInitializingRef.current || sessionIdRef.current) return;
    isInitializingRef.current = true;

    try {
      await getOrCreateSession();
    } catch (error) {
      console.error('[L.N.X Conversation] Error initializing session:', error);
    } finally {
      isInitializingRef.current = false;
    }
  }, [getOrCreateSession]);

  const sendMessage = useCallback(
    async (content: string) => {
      const cleanContent = content.trim();
      if (!cleanContent) return;

      setIsLoading(true);

      // Add user message immediately
      setMessages((prev) => [...prev, { role: 'user', content: cleanContent }]);

      const startTime = performance.now();
      addLog(`Sending prompt to Groq AI (${cleanContent.length} chars)`, 'info', 'GROQ');

      try {
        const token = localStorage.getItem('auth_token');
        const currentSessionId = await getOrCreateSession();

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token && token !== 'null' && token !== 'undefined') {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/chat/conversation', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            session_id: currentSessionId,
            message: cleanContent,
          }),
        });

        const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(2);

        if (!response.ok) {
          addLog(`Groq API failed with status ${response.status} (${elapsedSec}s)`, 'error', 'NET');
          throw new Error(`Server returned error status ${response.status}`);
        }

        const data = await response.json();
        const reply = data?.reply || 'I heard you, but could not generate a response. Could you try asking again?';

        addLog(`Groq AI responded in ${elapsedSec}s [openai/gpt-oss-20b]`, 'success', 'GROQ');

        // Add assistant response
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      } catch (error) {
        console.error('[L.N.X Conversation] Error sending message:', error);
        addLog(`Conversation pipeline error: ${error instanceof Error ? error.message : 'Network error'}`, 'error', 'NET');
        // Fallback friendly reply if connection drops
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "I'm having a brief connection hiccup reaching the AI server. Please try saying that once more!",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [addLog, getOrCreateSession]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    sessionId,
    initializeSession,
  };
};
