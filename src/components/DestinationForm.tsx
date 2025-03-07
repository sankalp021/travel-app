"use client";

import { useState } from "react";
import Image from "next/image";
import { FiSearch, FiMapPin, FiMap } from "react-icons/fi";

interface DestinationFormProps {
  onSubmit: (destination: string) => void;
  isLoading: boolean;
}

export default function DestinationForm({ onSubmit, isLoading }: DestinationFormProps) {
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onSubmit(destination);
    }
  };

  const popularDestinations = [
    "Bangkok, Thailand",
    "Bali, Indonesia",
    "Lisbon, Portugal",
    "Mexico City, Mexico",
    "Berlin, Germany",
    "Hanoi, Vietnam"
  ];

  const handleQuickSelect = (dest: string) => {
    setDestination(dest);
  };

  return (
    <div className="relative max-w-lg mx-auto">
      <div className="relative backdrop-blur-sm border border-gray-800 bg-gray-900/70 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/10 z-0"></div>
        
        {/* Subtle travel pattern */}
        <div className="absolute inset-0 opacity-5 bg-repeat z-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
        }}></div>
        
        <div className="relative p-8 z-10">
          <div className="flex justify-center mb-6">
            <div className="relative h-16 w-16 ">
              <Image 
              src="/abc.png"
              alt="Backpacker Logo" 
              width={48}
              height={48}
              className="text-white"
              />
              {/* <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-sm"></div> */}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            Mondee Compass
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Discover your next adventure with AI
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="destination" className="flex items-center gap-1.5 text-sm font-medium mb-2 text-gray-300">
                <FiMapPin className="text-blue-400" />
                Where are you heading next?
              </label>
              <div className="relative">
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Bangkok, Thailand"
                  className="w-full pl-4 pr-10 py-3 border border-gray-700 bg-gray-800/90 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-500 text-gray-200"
                  required
                  disabled={isLoading}
                />
                <FiMap className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-4 rounded-lg shadow-lg shadow-blue-900/30 flex justify-center items-center transition-all duration-300"
              disabled={isLoading || !destination.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exploring destinations...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiSearch />
                  Start Your Adventure
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-sm font-medium text-gray-400 mb-3">
              Popular backpacker destinations:
            </p>
            <div className="flex flex-wrap gap-2">
              {popularDestinations.map((dest) => (
                <button
                  key={dest}
                  onClick={() => handleQuickSelect(dest)}
                  className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 hover:border-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
