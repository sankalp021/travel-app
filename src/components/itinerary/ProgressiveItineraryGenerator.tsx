"use client";

import { useEffect, useState } from "react";
import { Activity, Stay, Transport, SocialSpot, TripPreferences, ItineraryResult } from "@/lib/types";
import { motion } from "framer-motion";
import { FiCheckCircle, FiClock, FiLoader } from "react-icons/fi";

interface ProgressiveItineraryGeneratorProps {
  destination: string;
  selectedActivities: Activity[];
  selectedStay: Stay | null;
  selectedTransport: Transport[];
  selectedSocialSpots: SocialSpot[];
  preferences: TripPreferences;
  onComplete: (result: ItineraryResult) => void;
  onError: (error: string) => void;
}

type GenerationStep = {
  id: 'schedule' | 'budget' | 'tips' | 'merging';
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
};

export default function ProgressiveItineraryGenerator({
  destination,
  selectedActivities,
  selectedStay,
  selectedTransport,
  selectedSocialSpots,
  preferences,
  onComplete,
  onError,
}: ProgressiveItineraryGeneratorProps) {
  // State for steps progress
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'schedule', label: 'Creating your daily schedule', status: 'pending' },
    { id: 'budget', label: 'Calculating budget breakdown', status: 'pending' },
    { id: 'tips', label: 'Gathering local tips and recommendations', status: 'pending' },
    { id: 'merging', label: 'Finalizing your itinerary', status: 'pending' },
  ]);
  
  // State for partial results
  const [partialResults, setPartialResults] = useState<{
    schedule?: any;
    budget?: any;
    tips?: any;
  }>({});
  
  // Overall progress state
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    const generateItinerary = async () => {
      try {
        // Prepare data for API
        const payload = {
          destination,
          selectedActivities,
          selectedStay,
          selectedTransport,
          selectedSocialSpots,
          preferences,
        };
        
        // Update first step to active
        updateStepStatus('schedule', 'active', 'Creating your daily schedule...');
        
        // Create progressive fetch request
        const response = await fetch("/api/generateItinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok || !response.body) {
          throw new Error("Failed to generate itinerary");
        }
        
        // Set up streaming reader
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        
        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines from buffer
          let lineBreakIndex;
          while ((lineBreakIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, lineBreakIndex);
            buffer = buffer.slice(lineBreakIndex + 1);
            
            if (line.trim()) {
              try {
                const message = JSON.parse(line);
                
                // Process each step
                switch (message.step) {
                  case "schedule":
                    updateStepStatus('schedule', 'active', message.message);
                    setProgress(10);
                    break;
                    
                  case "schedule_complete":
                    setPartialResults(prev => ({ ...prev, schedule: message.data }));
                    updateStepStatus('schedule', 'complete');
                    updateStepStatus('budget', 'active', 'Calculating your budget...');
                    setProgress(30);
                    break;
                    
                  case "budget":
                    setCurrentMessage(message.message);
                    setProgress(40);
                    break;
                    
                  case "budget_complete":
                    setPartialResults(prev => ({ ...prev, budget: message.data }));
                    updateStepStatus('budget', 'complete');
                    updateStepStatus('tips', 'active', 'Finding local tips...');
                    setProgress(60);
                    break;
                    
                  case "tips":
                    setCurrentMessage(message.message);
                    setProgress(70);
                    break;
                    
                  case "tips_complete":
                    setPartialResults(prev => ({ ...prev, tips: message.data }));
                    updateStepStatus('tips', 'complete');
                    updateStepStatus('merging', 'active', 'Finalizing itinerary...');
                    setProgress(85);
                    break;
                    
                  case "merging":
                    setCurrentMessage(message.message);
                    setProgress(95);
                    break;
                    
                  case "complete":
                    updateStepStatus('merging', 'complete');
                    setProgress(100);
                    // Wait a moment to show completion before transition
                    setTimeout(() => {
                      onComplete(message.data);
                    }, 800);
                    break;
                    
                  case "error":
                    throw new Error(message.error || "An error occurred");
                }
              } catch (e) {
                console.error("Error processing message:", e, line);
              }
            }
          }
        }
      } catch (err: any) {
        const steps = ['schedule', 'budget', 'tips', 'merging'] as const;
        const activeStep = steps.find(id => getStepStatus(id) === 'active') || 'schedule';
        updateStepStatus(activeStep, 'error');
        onError(err.message || "Failed to generate itinerary");
      }
    };

    generateItinerary();
  }, []);

  // Helper function to update step status
  const updateStepStatus = (
    stepId: 'schedule' | 'budget' | 'tips' | 'merging',
    status: 'pending' | 'active' | 'complete' | 'error',
    message = ''
  ) => {
    if (message) setCurrentMessage(message);
    
    setSteps(currentSteps =>
      currentSteps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  // Helper function to get step status
  const getStepStatus = (stepId: 'schedule' | 'budget' | 'tips' | 'merging') => {
    return steps.find(step => step.id === stepId)?.status || 'pending';
  };

  // Get the status icon for a step
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <FiCheckCircle className="text-green-400" />;
      case 'active':
        return <FiLoader className="animate-spin text-blue-400" />;
      case 'error':
        return <span className="text-red-400">!</span>;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  return (
    <div className="backdrop-blur-sm bg-gray-950/70 border border-gray-800 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col items-center justify-center py-6">
        <h2 className="text-xl font-bold text-gray-200">Creating Your {destination} Itinerary</h2>
        <p className="mt-2 text-gray-400 text-center max-w-md mb-6">
          We're building your travel plan step by step. This process takes a moment to ensure quality results.
        </p>
        
        {/* Progress bar */}
        <div className="w-full max-w-md mt-2 mb-6">
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Steps display */}
        <div className="w-full max-w-lg mt-2">
          <ul className="space-y-3">
            {steps.map(step => (
              <motion.li 
                key={step.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center p-3 rounded-lg border ${
                  step.status === 'active' ? 'bg-blue-900/20 border-blue-800' : 
                  step.status === 'complete' ? 'bg-green-900/10 border-green-800' :
                  step.status === 'error' ? 'bg-red-900/20 border-red-800' :
                  'bg-gray-800/20 border-gray-700'
                }`}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-grow">
                  <p className={`text-sm ${
                    step.status === 'active' ? 'text-blue-300' : 
                    step.status === 'complete' ? 'text-green-300' :
                    step.status === 'error' ? 'text-red-300' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.status === 'active' && (
                    <p className="text-xs text-gray-500 mt-1">{currentMessage}</p>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
