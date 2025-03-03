"use client";

import { useEffect, useState } from "react";
import { Activity, Stay, Transport, SocialSpot, TripPreferences, ItineraryResult } from "@/lib/types";
import { motion } from "framer-motion";

interface StreamingItineraryGeneratorProps {
  destination: string;
  selectedActivities: Activity[];
  selectedStay: Stay | null;
  selectedTransport: Transport[];
  selectedSocialSpots: SocialSpot[];
  preferences: TripPreferences;
  onComplete: (result: ItineraryResult) => void;
  onStatusUpdate: (message: string) => void;
  onError: (error: string) => void;
  statusMessages: string[];
}

export default function StreamingItineraryGenerator({
  destination,
  selectedActivities,
  selectedStay,
  selectedTransport,
  selectedSocialSpots,
  preferences,
  onComplete,
  onStatusUpdate,
  onError,
  statusMessages,
}: StreamingItineraryGeneratorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    
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

        // Start progress animation
        let currentProgress = 0;
        progressInterval = setInterval(() => {
          currentProgress += 1;
          if (currentProgress > 95) clearInterval(progressInterval);
          setProgress(Math.min(currentProgress, 95));
        }, 500);

        // Create fetch request with streaming response
        const response = await fetch("/api/generateItinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok || !response.body) {
          clearInterval(progressInterval);
          throw new Error("Failed to generate itinerary");
        }

        // Set up streaming reader
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        
        // Track processed messages to avoid duplicates
        const processedMessages = new Set<string>();

        // Process the stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            clearInterval(progressInterval);
            break;
          }
          
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
                const messageId = message.type + (message.message || JSON.stringify(message.data));
                
                // Skip if we've already processed this exact message
                if (processedMessages.has(messageId)) continue;
                processedMessages.add(messageId);
                
                if (message.type === "status") {
                  onStatusUpdate(message.message);
                } else if (message.type === "result") {
                  clearInterval(progressInterval);
                  setProgress(100);
                  // Complete with slight delay for smooth animation
                  timeoutId = setTimeout(() => {
                    onComplete(message.data);
                    setIsLoading(false);
                  }, 500);
                  return;
                } else if (message.type === "error") {
                  clearInterval(progressInterval);
                  throw new Error(message.message);
                }
              } catch (e) {
                console.error("Error parsing streaming message:", e, line);
              }
            }
          }
        }
        
        clearInterval(progressInterval);
        onError("Incomplete response received. Please try again.");
        setIsLoading(false);
        
      } catch (err: any) {
        if (progressInterval) clearInterval(progressInterval);
        onError(err.message || "Failed to generate itinerary");
        setIsLoading(false);
        setProgress(0);
      }
    };

    generateItinerary();
    
    // Clean up function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="backdrop-blur-sm bg-gray-950/70 border border-gray-800 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-t-2 border-indigo-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute inset-6 rounded-full border-t-2 border-purple-500 animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>
        <h2 className="mt-8 text-xl font-bold text-gray-200">Creating Your Perfect Itinerary</h2>
        <p className="mt-2 text-gray-400 text-center max-w-md mb-6">
          We're designing a personalized travel plan for {destination} based on your selections.
        </p>
        
        {/* Progress bar */}
        <div className="w-full max-w-md mt-2 mb-6">
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Status Messages */}
        <div className="w-full max-w-md mt-4">
          {statusMessages.map((message, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700"
            >
              <p className="text-gray-300">{message}</p>
            </motion.div>
          ))}
          
          {isLoading && statusMessages.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center mt-4"
            >
              <div className="mr-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="mr-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
