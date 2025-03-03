"use client";

import { useState } from "react";
import { Activity, Stay, Transport, SocialSpot, DestinationData } from "@/lib/types";
import { FiCheck, FiChevronRight, FiMapPin, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import ActivityCard from "../destination/ActivityCard";
import StayCard from "../destination/StayCard";
import TransportCard from "../destination/TransportCard";
import SocialSpotCard from "../destination/SocialSpotCard";
import SelectionSummary from "./SelectionSummary";

interface SelectionManagerProps {
  destination: string;
  destinationData: DestinationData;
  onContinue: (selections: {
    selectedActivities: Activity[];
    selectedStay: Stay | null;
    selectedTransport: Transport[];
    selectedSocialSpots: SocialSpot[];
  }) => void;
}

export default function SelectionManager({
  destination,
  destinationData,
  onContinue,
}: SelectionManagerProps) {
  // State for tracking selections
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<Transport[]>([]);
  const [selectedSocialSpots, setSelectedSocialSpots] = useState<SocialSpot[]>([]);
  
  // Current selection step
  const [currentStep, setCurrentStep] = useState<
    "activities" | "stays" | "transport" | "social" | "review"
  >("activities");

  // Toggle activity selection
  const toggleActivitySelection = (activity: Activity) => {
    setSelectedActivities(prev => {
      const isSelected = prev.some(a => a.id === activity.id);
      if (isSelected) {
        return prev.filter(a => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };

  // Set selected stay
  const selectStay = (stay: Stay) => {
    setSelectedStay(prev => (prev?.id === stay.id ? null : stay));
  };

  // Toggle transport selection
  const toggleTransportSelection = (transport: Transport) => {
    setSelectedTransport(prev => {
      const isSelected = prev.some(t => t.id === transport.id);
      if (isSelected) {
        return prev.filter(t => t.id !== transport.id);
      } else {
        return [...prev, transport];
      }
    });
  };

  // Toggle social spot selection
  const toggleSocialSpotSelection = (spot: SocialSpot) => {
    setSelectedSocialSpots(prev => {
      const isSelected = prev.some(s => s.id === spot.id);
      if (isSelected) {
        return prev.filter(s => s.id !== spot.id);
      } else {
        return [...prev, spot];
      }
    });
  };
  
  // Continue to next step
  const handleNextStep = () => {
    switch (currentStep) {
      case "activities":
        setCurrentStep("stays");
        break;
      case "stays":
        setCurrentStep("transport");
        break;
      case "transport":
        setCurrentStep("social");
        break;
      case "social":
        setCurrentStep("review");
        break;
      case "review":
        onContinue({
          selectedActivities,
          selectedStay,
          selectedTransport,
          selectedSocialSpots,
        });
        break;
    }
  };
  
  // Go back to previous step
  const handlePreviousStep = () => {
    switch (currentStep) {
      case "stays":
        setCurrentStep("activities");
        break;
      case "transport":
        setCurrentStep("stays");
        break;
      case "social":
        setCurrentStep("transport");
        break;
      case "review":
        setCurrentStep("social");
        break;
    }
  };
  
  // Check if can proceed
  const canProceed = () => {
    switch (currentStep) {
      case "activities":
        return selectedActivities.length > 0;
      case "stays":
        return true; // Stay is optional
      case "transport":
        return selectedTransport.length > 0;
      case "social":
        return true; // Social spots are optional
      case "review":
        return true;
      default:
        return false;
    }
  };
  
  // Group activities by category
  const activityCategories: Record<string, Activity[]> = {};
  destinationData.activities.forEach(activity => {
    if (!activityCategories[activity.category]) {
      activityCategories[activity.category] = [];
    }
    activityCategories[activity.category].push(activity);
  });
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "activities":
        return (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-300 text-sm px-3 py-1.5 rounded-full mb-2">
                <FiCheck className="w-4 h-4" />
                Step 1 of 5
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-100">Select Activities</h2>
              <p className="text-gray-400">
                Choose activities that interest you for your trip to {destination}. 
                We recommend selecting at least 5-10 activities for a balanced itinerary.
              </p>
            </div>
            
            {Object.entries(activityCategories).map(([category, activities]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-800 pb-2">
                  {category} <span className="text-gray-500 text-sm">({activities.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activities.map((activity) => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity}
                      selected={selectedActivities.some(a => a.id === activity.id)}
                      onSelect={() => toggleActivitySelection(activity)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
        
      case "stays":
        return (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-300 text-sm px-3 py-1.5 rounded-full mb-2">
                <FiCheck className="w-4 h-4" />
                Step 2 of 5
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-100">Choose Accommodation</h2>
              <p className="text-gray-400">
                Select one place to stay during your trip to {destination}.
                You can skip this step if you're not sure yet - we'll suggest options later.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinationData.stays.map((stay) => (
                <StayCard 
                  key={stay.id} 
                  stay={stay}
                  selected={selectedStay?.id === stay.id}
                  onSelect={() => selectStay(stay)}
                />
              ))}
            </div>
          </div>
        );
        
      case "transport":
        return (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-300 text-sm px-3 py-1.5 rounded-full mb-2">
                <FiCheck className="w-4 h-4" />
                Step 3 of 5
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-100">Select Transport Options</h2>
              <p className="text-gray-400">
                Choose transportation methods you'd like to use during your stay in {destination}.
                Select at least one option.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destinationData.transport.map((transport) => (
                <TransportCard 
                  key={transport.id} 
                  transport={transport}
                  selected={selectedTransport.some(t => t.id === transport.id)}
                  onSelect={() => toggleTransportSelection(transport)}
                />
              ))}
            </div>
          </div>
        );
        
      case "social":
        return (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-300 text-sm px-3 py-1.5 rounded-full mb-2">
                <FiCheck className="w-4 h-4" />
                Step 4 of 5
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-100">Social & Meetup Spots</h2>
              <p className="text-gray-400">
                Select social venues where you'd like to meet other travelers in {destination}.
                This step is optional - we'll include recommendations either way.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinationData.socialSpots.map((spot) => (
                <SocialSpotCard 
                  key={spot.id} 
                  spot={spot}
                  selected={selectedSocialSpots.some(s => s.id === spot.id)}
                  onSelect={() => toggleSocialSpotSelection(spot)}
                />
              ))}
            </div>
          </div>
        );
        
      case "review":
        return (
          <SelectionSummary 
            destination={destination}
            selectedActivities={selectedActivities}
            selectedStay={selectedStay}
            selectedTransport={selectedTransport}
            selectedSocialSpots={selectedSocialSpots}
          />
        );
    }
  };

  return (
    <div className="backdrop-blur-sm bg-gray-950/70 border border-gray-800 rounded-2xl p-6 shadow-xl pb-24">
      {/* Selection progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["activities", "stays", "transport", "social", "review"].map((step, index) => (
            <div 
              key={step} 
              className="flex flex-col items-center"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                currentStep === step 
                  ? "bg-blue-600 text-white" 
                  : (["activities", "stays", "transport", "social", "review"].indexOf(currentStep) > index 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-800 text-gray-400")
              }`}>
                {["activities", "stays", "transport", "social", "review"].indexOf(currentStep) > index 
                  ? <FiCheck className="w-4 h-4" />
                  : index + 1
                }
              </div>
              <div className="hidden md:block text-xs text-gray-400">
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </div>
            </div>
          ))}
          
          {/* Connecting lines */}
          <div className="absolute left-0 right-0 flex justify-center mt-4 z-0 px-12">
            <div className="h-0.5 bg-gray-800 w-full"></div>
          </div>
        </div>
      </div>
      
      {/* Current step content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>
      
      {/* Floating selection count badge */}
      {currentStep !== "review" && (
        <div className="fixed bottom-24 right-6 z-20">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-medium rounded-full px-4 py-3 shadow-xl flex items-center gap-2">
            <div className="bg-blue-700 rounded-full w-6 h-6 flex items-center justify-center">
              {selectedActivities.length}
            </div>
            <span className="text-sm">items selected</span>
          </div>
        </div>
      )}
      
      {/* Fixed position navigation bar - ALWAYS VISIBLE */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 border-t border-gray-800 py-4 px-6 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {currentStep !== "activities" ? (
            <button
              onClick={handlePreviousStep}
              className="px-5 py-2.5 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {/* ENHANCED NEXT/CONTINUE BUTTON */}
          <button
            onClick={handleNextStep}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              canProceed()
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-900/20 animate-pulse"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentStep === "review" ? "Generate Itinerary" : "Continue"}
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
