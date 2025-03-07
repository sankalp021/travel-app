"use client";

import React, { useState } from "react";
import { TripPreferences } from "@/lib/types";
import { FiCalendar, FiDollarSign, FiClock, FiTarget, FiCheckCircle, FiInfo, FiArrowLeft } from "react-icons/fi";

interface TripDetailsFormProps {
  onSubmit: (preferences: TripPreferences) => void;
  onBack: () => void;
  initialPreferences?: Partial<TripPreferences>;
  isLoading?: boolean;
}

const interestOptions = [
  { id: "culture", label: "Culture & History" },
  { id: "nature", label: "Nature & Outdoors" },
  { id: "food", label: "Food & Cuisine" },
  { id: "adventure", label: "Adventure & Sports" },
  { id: "nightlife", label: "Nightlife" },
  { id: "shopping", label: "Shopping" },
  { id: "relaxation", label: "Relaxation" },
  { id: "photography", label: "Photography" },
  { id: "local", label: "Local Experiences" }
];

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "glutenFree", label: "Gluten Free" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
  { id: "nutAllergy", label: "Nut Allergy" },
  { id: "dairyFree", label: "Dairy Free" }
];

export default function TripDetailsForm({ 
  onSubmit, 
  onBack, 
  initialPreferences, 
  isLoading = false 
}: TripDetailsFormProps) {
  // Get today's date for the date picker min value
  const today = new Date().toISOString().split('T')[0];
  
  // State for form fields
  const [startDate, setStartDate] = useState(initialPreferences?.startDate || "");
  const [endDate, setEndDate] = useState(initialPreferences?.endDate || "");
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'moderate' | 'luxury'>(
    initialPreferences?.budgetLevel || 'budget'
  );
  const [travelStyle, setTravelStyle] = useState<'relaxed' | 'balanced' | 'packed'>(
    initialPreferences?.travelStyle || 'balanced'
  );
  const [interests, setInterests] = useState<string[]>(initialPreferences?.interests || ["culture"]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialPreferences?.dietaryRestrictions || []);
  const [additionalNotes, setAdditionalNotes] = useState(initialPreferences?.additionalNotes || "");
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        newErrors.endDate = "End date must be after start date";
      }
      
      // Calculate trip duration
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 14) {
        newErrors.endDate = "Trip duration cannot exceed 14 days";
      }
    }
    
    if (interests.length === 0) {
      newErrors.interests = "Select at least one interest";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const tripPreferences: TripPreferences = {
      startDate,
      endDate,
      budgetLevel,
      travelStyle,
      interests,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
      additionalNotes: additionalNotes.trim() || undefined
    };
    
    onSubmit(tripPreferences);
  };
  
  // Toggle interest selection
  const toggleInterest = (interestId: string) => {
    setInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };
  
  // Toggle dietary restriction
  const toggleDietary = (dietaryId: string) => {
    setDietaryRestrictions(prev => {
      if (prev.includes(dietaryId)) {
        return prev.filter(id => id !== dietaryId);
      } else {
        return [...prev, dietaryId];
      }
    });
  };

  return (
    <div className="backdrop-blur-sm bg-gray-950/70 border border-gray-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-indigo-900/30 p-1.5 rounded-full text-indigo-400">
            <FiInfo className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">
            Trip Details
          </h2>
        </div>
        <p className="text-gray-400 text-sm">
          Fine-tune your adventure by providing the following details for your itinerary.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dates Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiCalendar className="text-indigo-400" />
            <h3 className="text-gray-200 font-medium">Trip Dates</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm text-gray-400 mb-1">
                Start Date
              </label>
              <div className={`flex items-center rounded-lg border ${
                errors.startDate ? 'border-red-500' : 'border-gray-700'
              } bg-gray-900/80 overflow-hidden`}>
                <div className="bg-gray-800 p-3 border-r border-gray-700">
                  <FiCalendar className="text-indigo-400 w-5 h-5" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  className="w-full p-3 bg-transparent focus:outline-none focus:ring-0 text-gray-300"
                  disabled={isLoading}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm text-gray-400 mb-1">
                End Date
              </label>
              <div className={`flex items-center rounded-lg border ${
                errors.endDate ? 'border-red-500' : 'border-gray-700'
              } bg-gray-900/80 overflow-hidden`}>
                <div className="bg-gray-800 p-3 border-r border-gray-700">
                  <FiCalendar className="text-indigo-400 w-5 h-5" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  className="w-full p-3 bg-transparent focus:outline-none focus:ring-0 text-gray-300"
                  disabled={isLoading}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Budget Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="text-indigo-400" />
            <h3 className="text-gray-200 font-medium">Budget Level</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setBudgetLevel('budget')}
              className={`p-4 text-sm rounded-xl border transition-all ${
                budgetLevel === 'budget' 
                  ? 'border-green-500 bg-green-900/20 text-green-300' 
                  : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:bg-gray-800'
              }`}
              disabled={isLoading}
            >
              <div className="font-medium flex justify-center items-center gap-2 mb-1">
                {budgetLevel === 'budget' && <FiCheckCircle className="text-green-400" />}
                Budget
              </div>
              <div className="text-xs opacity-80">$25-50/day</div>
            </button>
            
            <button
              type="button"
              onClick={() => setBudgetLevel('moderate')}
              className={`p-4 text-sm rounded-xl border transition-all ${
                budgetLevel === 'moderate' 
                  ? 'border-blue-500 bg-blue-900/20 text-blue-300' 
                  : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:bg-gray-800'
              }`}
              disabled={isLoading}
            >
              <div className="font-medium flex justify-center items-center gap-2 mb-1">
                {budgetLevel === 'moderate' && <FiCheckCircle className="text-blue-400" />}
                Moderate
              </div>
              <div className="text-xs opacity-80">$50-100/day</div>
            </button>
            
            <button
              type="button"
              onClick={() => setBudgetLevel('luxury')}
              className={`p-4 text-sm rounded-xl border transition-all ${
                budgetLevel === 'luxury' 
                  ? 'border-purple-500 bg-purple-900/20 text-purple-300' 
                  : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:bg-gray-800'
              }`}
              disabled={isLoading}
            >
              <div className="font-medium flex justify-center items-center gap-2 mb-1">
                {budgetLevel === 'luxury' && <FiCheckCircle className="text-purple-400" />}
                Comfort
              </div>
              <div className="text-xs opacity-80">$100+/day</div>
            </button>
          </div>
        </div>
        
        {/* Travel Style Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="text-indigo-400" />
            <h3 className="text-gray-200 font-medium">Travel Pace</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTravelStyle('relaxed')}
              className={`p-4 text-sm rounded-xl border transition-all ${
                travelStyle === 'relaxed' 
                  ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300' 
                  : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:bg-gray-800'
              }`}
              disabled={isLoading}
            >
              <div className="font-medium flex justify-center items-center gap-2 mb-1">
                {travelStyle === 'relaxed' && <FiCheckCircle className="text-indigo-400" />}
                Relaxed
              </div>
              <div className="text-xs opacity-80">Few activities per day</div>
            </button>
            
            <button
              type="button"
              onClick={() => setTravelStyle('balanced')}
              className={`p-4 text-sm rounded-xl border transition-all ${
                travelStyle === 'balanced' 
                  ? 'border-blue-500 bg-blue-900/20 text-blue-300' 
                  : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:bg-gray-800'
              }`}
              disabled={isLoading}
            >
              <div className="font-medium flex justify-center items-center gap-2 mb-1">
                {travelStyle === 'balanced' && <FiCheckCircle className="text-blue-400" />}
                Balanced
              </div>
              <div className="text-xs opacity-80">Mix of activities & rest</div>
            </button>
            
            <button
              type="button"
              onClick={() => setTravelStyle('packed')}
              className={`p-4 text-sm rounded-xl border transition-all ${
                travelStyle === 'packed' 
                  ? 'border-teal-500 bg-teal-900/20 text-teal-300' 
                  : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:bg-gray-800'
              }`}
              disabled={isLoading}
            >
              <div className="font-medium flex justify-center items-center gap-2 mb-1">
                {travelStyle === 'packed' && <FiCheckCircle className="text-teal-400" />}
                Packed
              </div>
              <div className="text-xs opacity-80">Maximize experiences</div>
            </button>
          </div>
        </div>
        
        {/* Interests Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiTarget className="text-indigo-400" />
            <h3 className="text-gray-200 font-medium">Trip Interests</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(interest => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  interests.includes(interest.id) 
                    ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50' 
                    : 'bg-gray-900/50 text-gray-400 border border-gray-700 hover:bg-gray-800'
                }`}
                disabled={isLoading}
              >
                {interest.label}
              </button>
            ))}
          </div>
          {errors.interests && (
            <p className="mt-1 text-sm text-red-400">{errors.interests}</p>
          )}
        </div>
        
        {/* Dietary Restrictions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiInfo className="text-indigo-400" />
            <h3 className="text-gray-200 font-medium">Dietary Restrictions (Optional)</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleDietary(option.id)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  dietaryRestrictions.includes(option.id) 
                    ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50' 
                    : 'bg-gray-900/50 text-gray-400 border border-gray-700 hover:bg-gray-800'
                }`}
                disabled={isLoading}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Additional Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm text-gray-300">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any specific preferences or requirements for your trip..."
            className="w-full h-24 p-3 border border-gray-700 bg-gray-900/80 rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          ></textarea>
        </div>
        
        {/* Form Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2 justify-center"
            disabled={isLoading}
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Selection
          </button>
          
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Itinerary'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
