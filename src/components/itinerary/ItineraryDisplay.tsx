"use client";

import { useState, useEffect, useRef } from "react";
import { ItineraryResult } from "@/lib/types";
import { FiVolumeX, FiVolume2 } from "react-icons/fi";

// Define WebSpeech API types which aren't included in TypeScript by default
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Add global namespace for browser-specific implementations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Remove the inline declaration since we'll use the .d.ts file
import { 
  FiCalendar, 
  FiDollarSign, 
  FiBriefcase, 
  FiMapPin,
  FiMic,
  FiDownload,
  FiMail,
  FiX,
  FiInfo,
  FiZap,
  FiSend,
  FiPause,
  FiPlay
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram, FaWeixin, FaRobot, FaBrain } from "react-icons/fa";
import ItinerarySchedule from "./ItinerarySchedule";
import ItineraryBudget from "./ItineraryBudget";
import ItineraryPacking from "./ItineraryPacking";
import ItineraryTips from "./ItineraryTips";

interface ItineraryDisplayProps {
  itinerary: ItineraryResult;
  onBack?: () => void;
}

interface UserContactInfo {
  name: string;
  email: string;
  phone: string;
}

type ShareSource = 'email' | 'telegram';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ItineraryDisplay({ itinerary, onBack }: ItineraryDisplayProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'budget' | 'packing' | 'tips'>('schedule');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [shareSource, setShareSource] = useState<ShareSource>('email');
  const [contactInfo, setContactInfo] = useState<UserContactInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  // New state variables for Telegram waiting modal
  const [showAILearningScreen, setShowAILearningScreen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [aiLearningStep, setAiLearningStep] = useState(0);

  // New state variables for Ask AI modal
  const [showAskAIModal, setShowAskAIModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Reference to the Speech Recognition object
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const responseAreaRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Add new state variables for TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Add refs for tracking speech inactivity
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to stop recording after inactivity with improved logging
  const stopRecordingAfterInactivity = () => {
    if (isRecording && recognitionRef.current) {
      const inactiveTime = Date.now() - lastSpeechTimeRef.current;
      console.log(`Stopping recording due to inactivity of ${inactiveTime}ms`);
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: { results: string | any[]; }) => {
          // Reset inactivity timer whenever we get speech input
          const now = Date.now();
          const timeSinceLastSpeech = now - lastSpeechTimeRef.current;
          lastSpeechTimeRef.current = now;
          
          console.log(`Speech detected, ${timeSinceLastSpeech}ms since last speech`);
          
          // Clear any existing timeout and set a new one
          if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
          }
          
          inactivityTimeoutRef.current = setTimeout(() => {
            stopRecordingAfterInactivity();
          }, 4000); // 4 seconds
          
          let currentTranscript = '';
          let interimText = '';
          
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimText += event.results[i][0].transcript + ' ';
            }
          }
          
          setTranscript(currentTranscript);
          setInterimTranscript(interimText);
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          // Clear timeout on error
          if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
          }
        };
        
        recognition.onend = () => {
          setIsRecording(false);
          // Clear timeout when recording ends
          if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
            inactivityTimeoutRef.current = null;
          }
        };
        
        recognitionRef.current = recognition;
      } else {
        console.error('Speech recognition not supported in this browser');
      }
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Handle toggling voice recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Clear any pending timeout
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
      // Start the inactivity timer
      lastSpeechTimeRef.current = Date.now();
      inactivityTimeoutRef.current = setTimeout(() => {
        stopRecordingAfterInactivity();
      }, 4000); // Fix: Changed from 200ms to 4000ms (4 seconds) to match the timeout in onresult
      
      // Log when we start recording
      console.log("Recording started, timeout set for 4 seconds of inactivity");
    }
  };
  
  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAskAIModal) {
        // Escape key closes modal
        if (e.key === 'Escape') {
          toggleAskAIModal();
        }
        
        // Ctrl+Enter to submit question
        if (e.key === 'Enter' && e.ctrlKey && transcript.trim()) {
          handleAskAI();
        }
        
        // Space to toggle recording when not in input field
        if (e.key === ' ' && document.activeElement !== inputAreaRef.current && !isProcessing) {
          e.preventDefault();
          toggleRecording();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAskAIModal, transcript, isProcessing, toggleRecording]);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (responseAreaRef.current && messages.length > 0) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (showAskAIModal && inputAreaRef.current) {
      setTimeout(() => {
        inputAreaRef.current?.focus();
      }, 100);
    }
  }, [showAskAIModal]);
  
  // Speech synthesis function
  const speakText = (text: string) => {
    if (!speechSynthesisRef.current) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    // Clean text for speech (remove markdown formatting, etc)
    const cleanText = text.replace(/\*\*/g, '')  // Remove bold markdown
                         .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just text
                         .replace(/#+\s+/g, '')  // Remove markdown headers
                         .replace(/`([^`]+)`/g, '$1'); // Remove code formatting
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Get available voices and select a good one if available
    const voices = speechSynthesisRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') && voice.name.includes('Female') && voice.lang.startsWith('en')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Configure voice parameters
    utterance.rate = 1.0;  // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0;
    
    // Speech events
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    // Speak the text
    speechSynthesisRef.current.speak(utterance);
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Toggle voice response on/off
  const toggleVoiceResponse = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  // Handle submission of the question
  const handleAskAI = async () => {
    if (!transcript.trim()) {
      return;
    }
    
    // Stop recording if it's active when sending a message
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Clear any pending inactivity timeout
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    }
    
    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: transcript.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      console.log("Sending question to AI with itinerary context:", transcript);
      
      // Create a simplified version of the itinerary with key details
      const itineraryContext = {
        destination: itinerary.destination,
        summary: itinerary.summary,
        schedule: itinerary.schedule.map(day => ({
          day: day.date,
          activities: day.activities.map(a => a.activity)
        })),
        budget: {
          
          totalBudget: itinerary.budget.totalBudget
        },
        localTips: itinerary.localTips.slice(0, 3), // Just send a few tips for context
        transportRecommendations: itinerary.transportRecommendations.slice(0, 2)
      };
      
      // Try the simpler endpoint first
      try {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: transcript,
            itineraryData: itineraryContext
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          // Add assistant response to conversation
          const assistantMessage: Message = {
            role: 'assistant',
            content: result.answer || "I'm not able to answer that right now."
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setTranscript(''); // Clear input for next question
          setInterimTranscript('');
          setIsProcessing(false);

          // Speak the response if voice is enabled
          if (isVoiceEnabled && result.answer) {
            speakText(result.answer);
          }
          return; // Exit early if successful
        }
      } catch (firstError) {
        console.error("First endpoint failed:", firstError);
        // Continue to fallback
      }
      
      // Fallback to the original endpoint
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: transcript,
          itineraryData: itineraryContext
        }),
      });
      
      console.log("Response status:", response.status);
      const result = await response.json();
      
      if (!response.ok) {
        console.error("API error details:", result);
        throw new Error(result.error || result.details || "Failed to get AI response");
      }
      
      // Add assistant response to conversation
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.answer || "I'm not able to answer that right now."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setTranscript(''); // Clear input for next question
      setInterimTranscript('');

      // Speak the response if voice is enabled
      if (isVoiceEnabled && result.answer) {
        speakText(result.answer);
      }
      
    } catch (error: any) {
      console.error('Error asking AI:', error);
      
      // Add error message to conversation
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again later.`
      };
      
      setMessages(prev => [...prev, errorMessage]);

      // Speak error message if voice is enabled
      if (isVoiceEnabled) {
        speakText(`Sorry, I encountered an error: ${error.message}. Please try again later.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Toggle Ask AI modal with improved state management
  const toggleAskAIModal = () => {
    setShowAskAIModal(!showAskAIModal);
    if (!showAskAIModal) {
      // Reset state when opening modal
      setTranscript('');
      setInterimTranscript('');
      // Don't clear messages to maintain conversation history
      setIsRecording(false);
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    }
  };

  // Clear conversation
  const clearConversation = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    
    setMessages([]);
    setTranscript('');
    setInterimTranscript('');
    
    // Add a system welcome message
    const welcomeMessage = `Hello! I'm your travel assistant for your trip to ${itinerary.destination}. How can I help you today?`;
    const welcomeMessageObj: Message = {
      role: 'assistant',
      content: welcomeMessage
    };
    
    setMessages([welcomeMessageObj]);
    
    // Speak welcome message if voice is enabled
    if (isVoiceEnabled) {
      speakText(welcomeMessage);
    }
  };

  // Clean up speech synthesis when unmounting
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Telegram bot URL - replace with your actual chatbot URL
  const TELEGRAM_BOT_URL = "https://t.me/rbdesignflightassistantbot";

  // AI learning steps
  const learningSteps = [
    "Analyzing your travel preferences...",
    "Processing destination information...",
    "Training assistant with itinerary details...",
    "Configuring chatbot responses...",
    "Preparing personalized recommendations..."
  ];

  // Effect for countdown timer
  useEffect(() => {
    if (showAILearningScreen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        
        // Update learning step every ~4 seconds
        if (countdown % 4 === 0 && aiLearningStep < learningSteps.length - 1) {
          setAiLearningStep(current => current + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showAILearningScreen && countdown === 0) {
      // Redirect to Telegram when countdown reaches 0
      window.open(TELEGRAM_BOT_URL, '_blank');
      setShowAILearningScreen(false);
    }
  }, [showAILearningScreen, countdown, TELEGRAM_BOT_URL, aiLearningStep, learningSteps.length]);

  // Load ElevenLabs Convai widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

  }, []);

  // Function to download itinerary as JSON file
  
  // Function to download itinerary as JSON file
  const downloadItinerary = () => {
    try {
      // Convert the itinerary object to a JSON string
      const itineraryJson = JSON.stringify(itinerary, null, 2);
      
      // Create a blob from the JSON string
      const blob = new Blob([itineraryJson], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      
      // Set the download filename
      const filename = `${itinerary.destination.replace(/\s+/g, '_')}_itinerary.json`;
      link.download = filename;
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL to free up memory
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading itinerary:', error);
      alert('Failed to download itinerary data');
    }
  };

  // Handle opening the email modal
  const handleOpenEmailModal = (source: ShareSource = 'email') => {
    setShareSource(source);
    setIsEmailModalOpen(true);
  };

  // Handle input change for contact form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmitEmailForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsEmailSending(true);
      
      const response = await fetch('/api/sendItineraryEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itineraryData: itinerary,
          destinationName: itinerary.destination,
          userContactInfo: contactInfo,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Itinerary sent successfully to ${contactInfo.email}`);
        setIsEmailModalOpen(false);
        
        // If the share source was Telegram, show AI learning screen instead of direct redirect
        if (shareSource === 'telegram') {
          setShowAILearningScreen(true);
          setCountdown(50);
          setAiLearningStep(0);
        }
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error emailing itinerary:', error);
      alert(`Failed to send email: ${error.message}`);
    } finally {
      setIsEmailSending(false);
    }
  };

  // Function to handle features under development
  const handleFeatureInDevelopment = (feature: string) => {
    alert(`The ${feature} sharing feature is currently under development and will be available soon.`);
  };

  // Toggle AI assistant visibility
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };

  return (
    <div className="bg-gray-950/70 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-900/50 text-blue-300 text-sm px-3 py-1 rounded-full mb-2">
              <FiMapPin className="w-3.5 h-3.5" />
              Your Adventure Itinerary
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-blue-100">
              Backpacking in {itinerary.destination}
            </h1>
            <p className="text-gray-400 mt-1 max-w-2xl">
              {itinerary.summary}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-gray-300 hover:bg-gray-800 transition-colors"
              title="Talk to AI"
              onClick={toggleAskAIModal} // Changed to use the new toggle function
            >
              <FiMic className="w-4 h-4" />
              <span>Talk to AI</span>
            </button>
            
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-blue-300 hover:bg-gray-800 transition-colors"
              title="Email Itinerary"
              onClick={() => handleOpenEmailModal('email')}
              disabled={isEmailSending}
            >
              <FiMail className="w-8 h-8" />
            </button>
            
            <div className="flex gap-2">
              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-green-400/50 hover:bg-gray-800 transition-colors opacity-60  relative"
                title="WhatsApp sharing (coming soon)"
                onClick={() => handleFeatureInDevelopment("WhatsApp")}
              >
                <div className="absolute -bottom-1 -right-2 bg-gray-900 text-xs text-white px-1.5 py-0.5 rounded-full">X</div>
                <FaWhatsapp className="w-8 h-8" />
              </button>

              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-blue-400 hover:bg-gray-800 transition-colors"
                onClick={() => handleOpenEmailModal('telegram')}
                title="Chat with our Telegram Chatbot"
              >
                <FaTelegram className="w-8 h-8" />
              </button>

              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-green-500/50 hover:bg-gray-800 transition-colors opacity-60 relative"
                title="WeChat sharing (coming soon)"
                onClick={() => handleFeatureInDevelopment("WeChat")}
              >
                <div className="absolute -bottom-2 -right-2 bg-gray-900 text-xs text-white px-1.5 py-0.5 rounded-full">X</div>
                <FaWeixin className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'schedule' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab('schedule')}
          >
            <FiCalendar className="w-4 h-4" />
            <span>Daily Schedule</span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'budget' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab('budget')}
          >
            <FiDollarSign className="w-4 h-4" />
            <span>Budget</span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'packing' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab('packing')}
          >
            <FiBriefcase className="w-4 h-4" />
            <span>Packing List</span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'tips' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab('tips')}
          >
            <FiMapPin className="w-4 h-4" />
            <span>Local Tips</span>
          </button>
        </div>
      </div>
      
      {/* AI Assistant - ElevenLabs Convai Widget */}
      {showAIAssistant && (
        <div className="fixed bottom-5 right-5 z-50 shadow-xl">
          <div className="bg-gray-800 rounded-lg p-2 mb-2 flex justify-between items-center">
            <span className="text-white text-sm font-medium">AI Travel Assistant</span>
            <button 
              onClick={toggleAIAssistant}
              className="text-gray-400 hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          {/* Use dangerouslySetInnerHTML to render the custom element */}
          <div ref={(el) => {
            if (el && !el.hasChildNodes()) {
              const widget = document.createElement('elevenlabs-convai');
              widget.setAttribute('agent-id', 'p4BrI7UwdAL6muy0zP3v');
              el.appendChild(widget);
            }
          }} />
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'schedule' && <ItinerarySchedule schedule={itinerary.schedule} />}
        {activeTab === 'budget' && <ItineraryBudget budget={itinerary.budget} />}
        {activeTab === 'packing' && <ItineraryPacking packingList={itinerary.packingList} />}
        {activeTab === 'tips' && (
          <ItineraryTips 
            localTips={itinerary.localTips} 
            transportRecommendations={itinerary.transportRecommendations}
          />
        )}
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                {shareSource === 'telegram' 
                  ? 'Share via Telegram & Email'
                  : 'Send Itinerary by Email'}
              </h2>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 mb-4">
              {shareSource === 'telegram'
                ? 'Please provide your contact information to receive the itinerary and connect with our Telegram chatbot.'
                : 'Please provide your contact information to receive the itinerary by email.'}
            </p>

            <form onSubmit={handleSubmitEmailForm}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isEmailSending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEmailSending 
                    ? "Sending..." 
                    : shareSource === 'telegram' 
                      ? "Send & Continue to Telegram" 
                      : "Send Itinerary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Learning Screen Modal */}
      {showAILearningScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-gray-900/80 border border-blue-700 rounded-xl shadow-xl w-full max-w-md p-8 text-center relative overflow-hidden">
            {/* Background elements - floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-5 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75" style={{animationDuration: "3s", animationDelay: "0.2s"}}></div>
              <div className="absolute top-20 left-20 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-50" style={{animationDuration: "2.5s", animationDelay: "0.5s"}}></div>
              <div className="absolute bottom-20 left-12 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75" style={{animationDuration: "4s", animationDelay: "1s"}}></div>
              <div className="absolute top-12 right-20 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-60" style={{animationDuration: "3.5s", animationDelay: "0.7s"}}></div>
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-75" style={{animationDuration: "3s", animationDelay: "1.5s"}}></div>
            </div>
            
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Outer spinner */}
                <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" style={{animationDuration: "3s"}}></div>
                
                {/* Middle spinner */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{animationDuration: "2s"}}></div>
                </div>
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBrain className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-blue-300 mb-4">
              AI is learning your itinerary
            </h2>
            
            <div className="text-gray-300 mb-4 h-16 flex items-center justify-center">
              <p className="animate-fadeIn">
                {learningSteps[aiLearningStep]}
              </p>
            </div>
            
            <p className="text-gray-400 mb-4">
              Connecting to Telegram in <span className="text-blue-400 font-bold">{countdown}</span> seconds...
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((50 - countdown) / 50) * 100}%` }}
              ></div>
            </div>
            
            {/* <button
              onClick={() => {
                window.open(TELEGRAM_BOT_URL, '_blank');
                setShowAILearningScreen(false);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 rounded-lg transition-colors border border-blue-800"
            >
              <FiZap className="w-4 h-4" />
              <span>Skip and continue now</span>
            </button> */}
          </div>
        </div>
      )}

      {/* Ask AI Modal */}
      {showAskAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
             role="dialog"
             aria-modal="true"
             aria-labelledby="ai-assistant-title">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-3xl p-0 overflow-hidden flex flex-col h-[80vh]">
            {/* Header - updated with voice toggle */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gradient-to-r from-blue-900/40 to-gray-900">
              <h2 id="ai-assistant-title" className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                <FiMic className="text-blue-400" />
                AI Travel Assistant
              </h2>
              <div className="flex items-center gap-3">
                {/* Voice response toggle button */}
                <button
                  onClick={toggleVoiceResponse}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                    isVoiceEnabled 
                      ? 'bg-green-800/70 text-green-200 hover:bg-green-700/70' 
                      : 'bg-gray-800/70 text-gray-400 hover:bg-gray-700/70'
                  }`}
                  title={isVoiceEnabled ? "Disable voice response" : "Enable voice response"}
                >
                  {isVoiceEnabled ? (
                    <>
                      <FiVolume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      Voice {isSpeaking ? 'Speaking...' : 'On'}
                    </>
                  ) : (
                    <>
                      <FiVolumeX className="w-3.5 h-3.5" />
                      Voice Off
                    </>
                  )}
                </button>
                
                {/* Existing clear conversation button */}
                {messages.length > 0 && (
                  <button 
                    onClick={clearConversation}
                    className="text-gray-400 hover:text-gray-200 flex items-center gap-1 text-xs bg-gray-800/70 px-2 py-1 rounded"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Clear
                  </button>
                )}
                
                {/* Existing close button */}
                <button 
                  onClick={toggleAskAIModal}
                  className="text-gray-400 hover:text-gray-200"
                  aria-label="Close dialog"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Messages area - scrollable */}
            <div 
              ref={responseAreaRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-gray-950"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="mb-4 p-3 bg-blue-900/20 rounded-full">
                    <FaRobot className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Ask me anything about your trip!
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md">
                    I can help with local recommendations, transportation options, budgeting advice, and anything else related to your itinerary for {itinerary.destination}.
                  </p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                    <button
                      onClick={() => {
                        setTranscript("What are the best local dishes to try?");
                        setTimeout(() => handleAskAI(), 100);
                      }}
                      className="text-left p-2 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg text-blue-300 transition-colors text-sm"
                    >
                      What are the best local dishes to try?
                    </button>
                    <button
                      onClick={() => {
                        setTranscript("How should I handle transportation?");
                        setTimeout(() => handleAskAI(), 100);
                      }}
                      className="text-left p-2 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg text-blue-300 transition-colors text-sm"
                    >
                      How should I handle transportation?
                    </button>
                    <button
                      onClick={() => {
                        setTranscript("What should I pack for this trip?");
                        setTimeout(() => handleAskAI(), 100);
                      }}
                      className="text-left p-2 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg text-blue-300 transition-colors text-sm"
                    >
                      What should I pack for this trip?
                    </button>
                    <button
                      onClick={() => {
                        setTranscript("What are common safety concerns?");
                        setTimeout(() => handleAskAI(), 100);
                      }}
                      className="text-left p-2 bg-blue-900/20 hover:bg-blue-900/30 rounded-lg text-blue-300 transition-colors text-sm"
                    >
                      What are common safety concerns?
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-xl p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-900/30 text-blue-50 rounded-tr-sm'
                          : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {message.role === 'user' ? (
                            <>You</>
                          ) : (
                            <>
                              <FaRobot size={12} />
                              <span>AI Assistant</span>
                            </>
                          )}
                        </div>
                        
                        {/* Add speech button for assistant messages */}
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => isVoiceEnabled ? speakText(message.content) : setIsVoiceEnabled(true)}
                            className="text-gray-400 hover:text-blue-300 p-1"
                            title="Read aloud"
                          >
                            <FiVolume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      
                      {/* Add retry button if this is an error message */}
                      {message.role === 'assistant' && message.content.includes('Sorry, I encountered an error') && (
                        <button 
                          onClick={() => {
                            // Get the last user message and try again
                            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
                            if (lastUserMessage) {
                              setTranscript(lastUserMessage.content);
                              setTimeout(() => handleAskAI(), 100);
                            }
                          }}
                          className="mt-2 text-xs bg-blue-800/50 hover:bg-blue-700/50 text-blue-300 px-2 py-1 rounded"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isProcessing && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-gray-800 rounded-xl p-4 max-w-[80%] rounded-tl-sm">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <FaRobot size={12} />
                      <span>AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="border-t border-gray-800 p-4 bg-gray-900/90">
              <div className="relative">
                <textarea
                  ref={inputAreaRef}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey && transcript.trim() && !isProcessing) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                  placeholder="Type your question or press the microphone to speak..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-24 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
                  disabled={isProcessing}
                  aria-label="Ask a question about your trip"
                />
                
                {interimTranscript && isRecording && (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-gray-800/80 border border-gray-700 rounded-lg p-2 text-gray-300 text-sm animate-fadeIn backdrop-blur-sm">
                    <em className="text-blue-300">{interimTranscript}</em>
                  </div>
                )}
                
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <button 
                    className={`p-2 rounded-full transition-all ${
                      isRecording 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    title={isRecording ? "Stop recording" : "Start recording"}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isRecording ? <FiPause className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
                  </button>
                  
                  <button
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAskAI}
                    disabled={!transcript.trim() || isProcessing}
                    title="Send message"
                    aria-label="Send message"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {isRecording && (
                <div className="flex items-center gap-2 text-xs text-blue-400 mt-2 animate-fadeIn">
                  <div className="flex space-x-1 items-center">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: "0.4s"}}></div>
                  </div>
                  <span>Listening... (click mic to stop)</span>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <div>
                  <span>Powered by Google Gemini</span>
                </div>
                <div className="flex gap-2">
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700">Esc</kbd>
                  <span>to close</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700">Ctrl+Enter</kbd>
                  <span>to send</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ...existing code for other components... */}
    </div>
  );
}
