import { useState, useCallback, useRef, useEffect } from 'react';
import { useSystemLogs } from '@/contexts/SystemLogContext';

export const useSpeechInput = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const isIntentListeningRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRecordedTextRef = useRef<string>('');
  const hasSubmittedRef = useRef<boolean>(false);
  const lastLoggedInterimRef = useRef<string>('');
  const { addLog } = useSystemLogs();

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const stopListening = useCallback(() => {
    isIntentListeningRef.current = false;
    clearSilenceTimer();
    lastRecordedTextRef.current = '';
    setInterimText('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const submitTranscript = useCallback(
    (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || hasSubmittedRef.current) return;

      hasSubmittedRef.current = true;
      addLog(`Speech finalized: "${cleanText}"`, 'success', 'MIC');

      // Stop listening before triggering message dispatch
      isIntentListeningRef.current = false;
      clearSilenceTimer();
      lastRecordedTextRef.current = '';
      setInterimText('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);

      // Send the recognized speech
      if (onTranscriptRef.current) {
        onTranscriptRef.current(cleanText);
      }
    },
    [addLog]
  );

  const submitAndStop = useCallback(() => {
    const textToSend = lastRecordedTextRef.current.trim();
    if (textToSend && !hasSubmittedRef.current) {
      submitTranscript(textToSend);
    } else {
      stopListening();
    }
  }, [stopListening, submitTranscript]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog('Web Speech API unavailable in this browser', 'error', 'MIC');
      alert("Your browser doesn't support speech recognition. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    // Reset session flags
    isIntentListeningRef.current = true;
    hasSubmittedRef.current = false;
    lastRecordedTextRef.current = '';
    lastLoggedInterimRef.current = '';
    setInterimText('');
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        addLog('Microphone active - listening for voice input', 'info', 'MIC');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalStr = '';
        let interimStr = '';
        let hasFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            finalStr = (finalStr + ' ' + transcript).trim();
            hasFinal = true;
          } else {
            interimStr = (interimStr + ' ' + transcript).trim();
          }
        }

        const fullSpoken = (finalStr + ' ' + interimStr).trim();
        lastRecordedTextRef.current = fullSpoken;
        setInterimText(fullSpoken);

        // Log first words detected in this utterance
        if (fullSpoken && !lastLoggedInterimRef.current) {
          lastLoggedInterimRef.current = fullSpoken;
          addLog(`Voice activity detected (${fullSpoken.slice(0, 24)}...)`, 'info', 'MIC');
        }

        if (fullSpoken) {
          clearSilenceTimer();

          // If a sentence is complete and finalized, wait 500ms; otherwise wait 850ms for natural pauses
          const delay = hasFinal ? 500 : 850;

          silenceTimerRef.current = setTimeout(() => {
            if (lastRecordedTextRef.current && isIntentListeningRef.current && !hasSubmittedRef.current) {
              submitTranscript(lastRecordedTextRef.current);
            }
          }, delay);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        addLog(`Speech recognition notice: ${event.error}`, 'warning', 'MIC');
      };

      recognition.onend = () => {
        // If recognition ended and we have pending speech that wasn't submitted yet
        if (lastRecordedTextRef.current && isIntentListeningRef.current && !hasSubmittedRef.current) {
          submitTranscript(lastRecordedTextRef.current);
          return;
        }

        // If user is still intending to listen and hasn't submitted yet, restart
        if (isIntentListeningRef.current && !hasSubmittedRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            setTimeout(() => {
              if (isIntentListeningRef.current && !hasSubmittedRef.current) {
                startListening();
              }
            }, 150);
            return;
          }
        }

        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      addLog('Failed to start speech recognition module', 'error', 'MIC');
      setIsListening(false);
      isIntentListeningRef.current = false;
    }
  }, [addLog, submitTranscript]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { isListening, interimText, startListening, stopListening, submitAndStop };
};
