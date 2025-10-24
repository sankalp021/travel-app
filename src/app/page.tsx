"use client";

import { useState } from "react";
import DestinationForm from "@/components/DestinationForm";
import { DestinationData } from "@/lib/types";
import ItineraryWorkflow from "@/components/itinerary/ItineraryWorkflow";
import { FiGlobe, FiMapPin } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [destinationData, setDestinationData] = useState<DestinationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleDestinationSubmit = async (destination: string) => {
    setDestination(destination);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/destination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination }),
      });
      
      if (!response.ok) {
        // Some error responses might not be JSON (HTML or plain text). Read as text
        const text = await response.text();
        let message = text || "Failed to fetch destination data";
        try {
          const parsed = JSON.parse(text);
          message = parsed?.details || parsed?.error || JSON.stringify(parsed);
        } catch (_) {
          // not JSON, keep raw text
        }
        throw new Error(message);
      }
      
      const result = await response.json();
      setDestinationData(result.data);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDestinationData(null);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="max-w-7xl mx-auto mb-8 sm:mb-12 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <div className="bg-blue-900/30 p-1.5 rounded-full text-blue-400">
            <FiGlobe className="w-4 h-4" />
          </div>
          <span className="text-blue-400 text-sm font-medium">Agentic AI Itinerary Planner Demo (Work in progress)</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200">
          Backpackers Compass
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
          Discover unique destinations, plan your journey, and connect with fellow travelers
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!destinationData && (
            <motion.div
              key="destination-form"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <DestinationForm onSubmit={handleDestinationSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {destinationData && (
            <motion.div
              key="itinerary-workflow"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
            >
              <ItineraryWorkflow
                destination={destination}
                destinationData={destinationData}
                onBack={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </main>
    </div>
  );
}
