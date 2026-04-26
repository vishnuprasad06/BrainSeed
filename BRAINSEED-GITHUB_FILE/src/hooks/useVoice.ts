import { useState, useCallback, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { useApp } from '../context/AppContext';

export const useVoice = () => {
  const [isReading, setIsReading] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<{ audio: HTMLAudioElement; url: string } | null>(null);
  const { isVoiceEnabled } = useApp();

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.audio.pause();
      URL.revokeObjectURL(currentAudio.url);
      setCurrentAudio(null);
    }
    setIsReading(null);
  }, [currentAudio]);

  const speak = useCallback(async (text: string, id: string = 'global') => {
    // If clicking the same button that's already reading, stop it
    if (isReading === id) {
      stop();
      return;
    }

    // Exempt explanation and feedback from voice toggle as per requirement
    if (!isVoiceEnabled && !['explanation', 'feedback'].includes(id)) {
      return;
    }

    // Stop current audio before starting new one
    stop();

    setIsReading(id);
    try {
      const audioData = await generateSpeech(text);
      if (audioData) {
        const audio = new Audio(audioData);
        setCurrentAudio({ audio, url: audioData });
        
        audio.onended = () => {
          setIsReading(null);
          URL.revokeObjectURL(audioData);
          setCurrentAudio(null);
        };
        
        audio.onerror = () => {
          setIsReading(null);
          URL.revokeObjectURL(audioData);
          setCurrentAudio(null);
        };

        await audio.play();
      } else {
        setIsReading(null);
      }
    } catch (error) {
      console.error("Voice Error:", error);
      setIsReading(null);
      stop();
    }
  }, [isReading, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.audio.pause();
        URL.revokeObjectURL(currentAudio.url);
      }
    };
  }, [currentAudio]);

  return { speak, stop, isReading };
};
