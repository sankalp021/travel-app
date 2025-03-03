"use client";

import { useState } from "react";
import DestinationForm from "@/components/DestinationForm";
import { DestinationData } from "@/lib/types";
import DestinationResults from "@/components/destination/DestinationResults";
import { FiGlobe } from "react-icons/fi";

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
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch destination data");
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

  return (
    <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="max-w-7xl mx-auto mb-8 sm:mb-12 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <div className="bg-blue-900/30 p-1.5 rounded-full text-blue-400">
            <FiGlobe className="w-4 h-4" />
          </div>
          <span className="text-blue-400 text-sm font-medium">AI-Powered Travel Guide</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200">
          Backpacker&apos;s Compass
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
          Discover unique destinations, plan your journey, and connect with fellow travelers
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        {!destinationData ? (
          <DestinationForm onSubmit={handleDestinationSubmit} isLoading={isLoading} />
        ) : (
          <DestinationResults 
            destination={destination}
            data={destinationData}
            onReset={handleReset}
          />
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg">
            {error}
          </div>
        )}
      </main>
      
      <footer className="max-w-7xl mx-auto mt-16 text-center text-gray-500 text-sm">
        <p>Powered by AI · Made for backpackers · <span className="text-blue-500">v1.0</span></p>
      </footer>
    </div>
  );
}
