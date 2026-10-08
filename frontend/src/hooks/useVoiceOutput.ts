import { useCallback, useRef } from 'react';
import { useSystemLogs } from '@/contexts/SystemLogContext';

export const useVoiceOutput = () => {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { addLog } = useSystemLogs();

  const stop = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    activeUtteranceRef.current = null;
  }, []);

  const fallbackBrowserTTS = useCallback(
    (text: string, onDone: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onDone();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        let hasFinished = false;
        const finishOnce = () => {
          if (!hasFinished) {
            hasFinished = true;
            if (safetyTimerRef.current) {
              clearTimeout(safetyTimerRef.current);
              safetyTimerRef.current = null;
            }
            activeUtteranceRef.current = null;
            addLog('Voice synthesis playback completed', 'info', 'TTS');
            onDone();
          }
        };

        utterance.onend = finishOnce;
        utterance.onerror = (e) => {
          console.warn('[L.N.X Voice] Browser TTS notice:', e);
          finishOnce();
        };

        // Keep reference to prevent garbage collection in Chromium
        activeUtteranceRef.current = utterance;

        // Safety timeout: max 80ms per character + 2.5s base buffer
        const estimatedMs = Math.max(2500, text.length * 80 + 2500);
        safetyTimerRef.current = setTimeout(() => {
          finishOnce();
        }, estimatedMs);

        const selectVoiceAndSpeak = () => {
          try {
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice =
              voices.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Natural') ||
                    v.name.includes('Google') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Jenny') ||
                    v.name.includes('Guy') ||
                    v.name.includes('David'))
              ) || voices.find((v) => v.lang.startsWith('en'));

            if (preferredVoice) {
              utterance.voice = preferredVoice;
              addLog(`Browser neural voice active: ${preferredVoice.name}`, 'success', 'TTS');
            } else {
              addLog('Browser default voice active', 'info', 'TTS');
            }

            window.speechSynthesis.speak(utterance);
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } catch (err) {
            console.warn('[L.N.X Voice] Failed to speak utterance:', err);
            finishOnce();
          }
        };

        if (window.speechSynthesis.getVoices().length > 0) {
          selectVoiceAndSpeak();
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            selectVoiceAndSpeak();
          };
          setTimeout(selectVoiceAndSpeak, 100);
        }
      } catch (err) {
        console.warn('[L.N.X Voice] Fallback TTS encountered error:', err);
        onDone();
      }
    },
    [addLog]
  );

  const speak = useCallback(
    async (text: string, voiceId: string = 'ErXwobaYiN019PkySvjV'): Promise<void> => {
      if (!text || !text.trim()) return;

      // Stop any active speech
      stop();

      // Sanitize spoken text
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`.*?`/g, '')
        .replace(/https?:\/\/\S+|www\.\S+/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[\*#_~`\\/\-+=\|^<>\[\]{}()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      addLog(`Generating audio stream (${cleanText.length} chars)`, 'info', 'TTS');

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

              addLog('Playing ElevenLabs HD audio stream', 'success', 'TTS');

              audio.onended = () => {
                currentAudioRef.current = null;
                URL.revokeObjectURL(audioUrl);
                addLog('ElevenLabs audio finished playing', 'info', 'TTS');
                resolve();
              };
              audio.onerror = () => {
                currentAudioRef.current = null;
                URL.revokeObjectURL(audioUrl);
                addLog('Audio player error -> using Browser TTS fallback', 'warning', 'TTS');
                fallbackBrowserTTS(cleanText, resolve);
              };

              await audio.play();
              playedBackendAudio = true;
            }
          } else {
            addLog('ElevenLabs quota limit reached (0 credits) -> routing to Browser TTS', 'warning', 'TTS');
          }
        } catch (err) {
          addLog('Backend voice service unreachable -> routing to Browser TTS', 'warning', 'TTS');
        }

        if (!playedBackendAudio) {
          fallbackBrowserTTS(cleanText, resolve);
        }
      });
    },
    [addLog, stop, fallbackBrowserTTS]
  );

  return { speak, stop };
};

