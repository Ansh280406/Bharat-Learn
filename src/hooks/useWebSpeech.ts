import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language } from '../types';

export function useWebSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSubtitle(null);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const speak = useCallback((text: string, lang: Language) => {
    stop();

    if (!synthRef.current) {
      console.warn('Speech synthesis is not supported on this browser.');
      setActiveSubtitle(text);
      setIsSpeaking(true);
      setIsPaused(false);
      setTimeout(() => {
        setIsSpeaking(false);
        setActiveSubtitle(null);
      }, Math.max(3000, text.length * 70));
      return;
    }

    setActiveSubtitle(text);
    setIsSpeaking(true);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    if (lang === 'en') {
      utterance.lang = 'en-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'gu') {
      utterance.lang = 'gu-IN';
    }

    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    
    // Control volume dynamically based on voiceEnabled state
    utterance.volume = voiceEnabled ? 1.0 : 0.0;

    const voices = synthRef.current.getVoices();
    let selectedVoice = null;

    if (lang === 'hi') {
      selectedVoice = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('hi_IN'));
    } else if (lang === 'gu') {
      selectedVoice = voices.find(v => v.lang.includes('gu-IN') || v.lang.includes('gu_IN'));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('hi-IN'));
      }
    } else {
      selectedVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSubtitle(null);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveSubtitle(null);
    };

    synthRef.current.speak(utterance);
  }, [stop, voiceEnabled]);

  return { speak, stop, pause, resume, isSpeaking, isPaused, voiceEnabled, setVoiceEnabled, activeSubtitle };
}
