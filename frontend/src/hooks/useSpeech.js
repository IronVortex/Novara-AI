import { useCallback, useEffect, useRef, useState } from "react";

const isSpeechSupported = () =>
  typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

export function useSpeech({ onResult }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported] = useState(isSpeechSupported);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      onResult?.(transcript, event.results[event.results.length - 1]?.isFinal);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [onResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  return { listening, supported, startListening, stopListening, speak };
}
