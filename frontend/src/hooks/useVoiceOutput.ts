import { useCallback, useRef } from 'react';

export const useVoiceOutput = () => {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const fallbackBrowserTTS = useCallback((text: string, onDone: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onDone();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => onDone();
    utterance.onerror = () => onDone();

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text: string, voiceId: string = 'ErXwobaYiN019PkySvjV'): Promise<void> => {
      if (!text || !text.trim()) return;

      // Stop any previous speech immediately to prevent audio overlap and echo
      stop();

      // Clean text to ensure crystal-clear speech and eliminate characters like -, /, *, #, etc.
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '') // remove code blocks
        .replace(/`.*?`/g, '') // remove inline code
        .replace(/https?:\/\/\S+|www\.\S+/g, '') // remove URLs
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
        .replace(/[\*#_~`\\/\-+=\|^<>\[\]{}()]/g, ' ') // replace special characters with space
        .replace(/\s+/g, ' ') // collapse multiple spaces
        .trim();

      if (!cleanText) return;

      return new Promise<void>(async (resolve) => {
        let playedBackendAudio = false;

        try {
          const token = localStorage.getItem('auth_token');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (token && token !== 'null' && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch('/api/voice/tts', {
            method: 'POST',
            headers,
            body: JSON.stringify({ text: cleanText, voice_id: voiceId }),
          });

          if (response.ok) {
            const audioBlob = await response.blob();
            if (audioBlob.size > 200) {
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              currentAudioRef.current = audio;

              audio.onended = () => {
                currentAudioRef.current = null;
                URL.revokeObjectURL(audioUrl);
                resolve();
              };
              audio.onerror = () => {
                currentAudioRef.current = null;
                URL.revokeObjectURL(audioUrl);
                fallbackBrowserTTS(cleanText, resolve);
              };

              await audio.play();
              playedBackendAudio = true;
            }
          }
        } catch (err) {
          console.warn('Backend TTS error, using browser TTS fallback:', err);
        }

        if (!playedBackendAudio) {
          fallbackBrowserTTS(cleanText, resolve);
        }
      });
    },
    [stop, fallbackBrowserTTS]
  );

  return { speak, stop };
};
