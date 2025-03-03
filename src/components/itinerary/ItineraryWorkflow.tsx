"use client";

import { useState } from "react";
import { Activity, Stay, Transport, SocialSpot, DestinationData, TripPreferences, ItineraryResult } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import SelectionManager from "./SelectionManager";
import TripDetailsForm from "./TripDetailsForm";
import ItineraryDisplay from "./ItineraryDisplay";
import { FiLoader } from "react-icons/fi";
import StreamingItineraryGenerator from "./StreamingItineraryGenerator";

interface ItineraryWorkflowProps {
  destination: string;
  destinationData: DestinationData;
  onBack: () => void;
}

type WorkflowStep = "selection" | "preferences" | "generating" | "result";

export default function ItineraryWorkflow({
  destination,
  destinationData,
  onBack,
}: ItineraryWorkflowProps) {
  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("selection");
  
  // Selection state
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<Transport[]>([]);
  const [selectedSocialSpots, setSelectedSocialSpots] = useState<SocialSpot[]>([]);
  
  // Trip preferences state
  const [tripPreferences, setTripPreferences] = useState<TripPreferences | null>(null);
  
  // Result state
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle selection completion
  const handleSelectionComplete = (selections: {
    selectedActivities: Activity[];
    selectedStay: Stay | null;
    selectedTransport: Transport[];
    selectedSocialSpots: SocialSpot[];
  }) => {
    setSelectedActivities(selections.selectedActivities);
    setSelectedStay(selections.selectedStay);
    setSelectedTransport(selections.selectedTransport);
    setSelectedSocialSpots(selections.selectedSocialSpots);
    setCurrentStep("preferences");
  };

  // Handle preferences completion
  const handlePreferencesComplete = async (preferences: TripPreferences) => {
    try {
      setTripPreferences(preferences);
      setIsLoading(true);
      setCurrentStep("generating");
      setError(null);
      
      // Prepare data for API
      const payload = {
        destination,
        selectedActivities,
        selectedStay,
        selectedTransport,
        selectedSocialSpots,
        preferences,
      };

      // Call the API
      const response = await fetch("/api/generateItinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate itinerary");
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setItinerary(result);
      setCurrentStep("result");
    } catch (err: any) {
      setError(err.message || "Failed to generate itinerary");
      setCurrentStep("preferences"); // Go back to preferences step on error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preferences back button
  const handlePreferencesBack = () => {
    setCurrentStep("selection");
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <AnimatePresence mode="wait">
      {currentStep === "selection" && (
        <motion.div
          key="selection"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          <SelectionManager
            destination={destination}
            destinationData={destinationData}
            onContinue={handleSelectionComplete}
          />
        </motion.div>
      )}

      {currentStep === "preferences" && (
        <motion.div
          key="preferences"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          <TripDetailsForm
            onSubmit={handlePreferencesComplete}
            onBack={handlePreferencesBack}
            isLoading={isLoading}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}
        </motion.div>
      )}

      {currentStep === "generating" && (
        <motion.div
          key="generating"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="backdrop-blur-sm bg-gray-950/70 border border-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-t-2 border-indigo-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-6 rounded-full border-t-2 border-purple-500 animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              <h2 className="mt-8 text-xl font-bold text-gray-200">Creating Your Perfect Itinerary</h2>
              <p className="mt-2 text-gray-400 text-center max-w-md">
                We're designing a personalized travel plan for {destination} based on your selections.
                This might take up to a minute...
              </p>
              
              {/* Simple progress bar */}
              <div className="w-full max-w-md mt-6">
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {currentStep === "result" && itinerary && (
        <motion.div
          key="result"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          <ItineraryDisplay 
            itinerary={itinerary} 
            onBack={() => setCurrentStep("preferences")}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
