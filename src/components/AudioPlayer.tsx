import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiVolumeX, FiVolume2 } from 'react-icons/fi';

interface AudioPlayerProps {
  text: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  useHighQuality?: boolean;
}

export default function AudioPlayer({ text, onPlayStateChange, useHighQuality = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Create audio element for high quality playback
      if (!audioRef.current) {
        audioRef.current = new Audio();
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          if (onPlayStateChange) onPlayStateChange(false);
        };
        
        audioRef.current.onerror = () => {
          setError('Failed to play audio');
          setIsPlaying(false);
          setIsLoading(false);
          if (onPlayStateChange) onPlayStateChange(false);
        };
      }
    }
    
    return () => {
      // Clean up
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);
  
  // Play text using Web Speech API or ElevenLabs API
  const playText = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    
    setError(null);
    
    if (useHighQuality) {
      // Use ElevenLabs for high quality voice
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/voice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to generate speech');
        }
        
        // Get audio blob
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          // Clean up previous audio URL
          if (audioRef.current.src) {
            URL.revokeObjectURL(audioRef.current.src);
          }
          
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
          setIsPlaying(true);
          if (onPlayStateChange) onPlayStateChange(true);
        }
      } catch (err: any) {
        console.error('Error playing audio:', err);
        setError(err.message || 'Failed to play audio');
        // Fallback to Web Speech API
        playWithWebSpeech();
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use Web Speech API
      playWithWebSpeech();
    }
  };
  
  // Play with Web Speech API
  const playWithWebSpeech = () => {
    if (!speechSynthesisRef.current) {
      setError('Speech synthesis not supported in this browser');
      return;
    }
    
    speechSynthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select a good voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') && voice.name.includes('Female') && voice.lang.startsWith('en')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      if (onPlayStateChange) onPlayStateChange(true);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setError('Speech synthesis error');
      if (onPlayStateChange) onPlayStateChange(false);
    };
    
    speechSynthesisRef.current.speak(utterance);
  };
  
  // Stop playback
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    setIsPlaying(false);
    if (onPlayStateChange) onPlayStateChange(false);
  };

  return (
    <div className="inline-flex items-center">
      <button
        onClick={playText}
        disabled={isLoading}
        className={`p-1.5 rounded-full transition-all ${
          isPlaying
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isPlaying ? 'Stop speaking' : 'Speak text'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-t-transparent border-blue-300 rounded-full animate-spin" />
        ) : isPlaying ? (
          <FiPause className="w-3.5 h-3.5" />
        ) : (
          <FiVolume2 className="w-3.5 h-3.5" />
        )}
      </button>
      
      {error && (
        <span className="text-xs text-red-400 ml-2">{error}</span>
      )}
    </div>
  );
}
