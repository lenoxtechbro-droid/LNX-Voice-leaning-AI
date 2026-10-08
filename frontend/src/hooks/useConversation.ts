import { useState, useCallback, useRef } from 'react';

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
  const isInitialized = useRef(false);

  // Helper to create/get session ID
  const getOrCreateSession = useCallback(async (): Promise<string> => {
    try {
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
          setSessionId(data.session_id);
          return data.session_id;
        }
      }
    } catch (e) {
      console.warn('Backend session start error, using local session ID:', e);
    }

    const fallbackId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
    setSessionId(fallbackId);
    return fallbackId;
  }, [sessionId]);

  const initializeSession = useCallback(async () => {
    if (isInitialized.current) return;
    
    try {
      const currentSessionId = await getOrCreateSession();
      isInitialized.current = true;
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [getOrCreateSession]);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);

    // Add user message immediately for better UX
    setMessages(prev => [...prev, { role: 'user', content }]);

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
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`);
      }

      const data = await response.json();
      
      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove user message if there's an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [getOrCreateSession]);

  return {
    messages,
    isLoading,
    sendMessage,
    sessionId,
    initializeSession,
  };
};
