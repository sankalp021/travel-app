"use client";

import { useState } from "react";
import { Activity, Stay, Transport, SocialSpot, DestinationData, TripPreferences, ItineraryResult } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import SelectionManager from "./SelectionManager";
import TripDetailsForm from "./TripDetailsForm";
import ItineraryDisplay from "./ItineraryDisplay";
import ProgressiveItineraryGenerator from "./ProgressiveItineraryGenerator";

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
  const handlePreferencesComplete = (preferences: TripPreferences) => {
    setTripPreferences(preferences);
    setCurrentStep("generating");
    setError(null);
  };

  // Handle itinerary generation completion
  const handleGenerationComplete = (result: ItineraryResult) => {
    setItinerary(result);
    setCurrentStep("result");
  };

  // Handle generation error
  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentStep("preferences");
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

      {currentStep === "generating" && tripPreferences && (
        <motion.div
          key="generating"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          <ProgressiveItineraryGenerator
            destination={destination}
            selectedActivities={selectedActivities}
            selectedStay={selectedStay}
            selectedTransport={selectedTransport}
            selectedSocialSpots={selectedSocialSpots}
            preferences={tripPreferences}
            onComplete={handleGenerationComplete}
            onError={handleGenerationError}
          />
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
