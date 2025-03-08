"use client";

import { useState } from "react";
import { ItineraryResult } from "@/lib/types";
import { 
  FiCalendar, 
  FiDollarSign, 
  FiBriefcase, 
  FiMapPin,
  FiMic,
  FiDownload,
  FiMail
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram, FaWeixin } from "react-icons/fa";
import ItinerarySchedule from "./ItinerarySchedule";
import ItineraryBudget from "./ItineraryBudget";
import ItineraryPacking from "./ItineraryPacking";
import ItineraryTips from "./ItineraryTips";

interface ItineraryDisplayProps {
  itinerary: ItineraryResult;
  onBack?: () => void;
}

export default function ItineraryDisplay({ itinerary, onBack }: ItineraryDisplayProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'budget' | 'packing' | 'tips'>('schedule');
  const [isEmailSending, setIsEmailSending] = useState(false);

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

  // Function to send the itinerary via email
  const emailItinerary = async () => {
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
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Itinerary sent successfully to xyz@gmail.com');
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
            >
              <FiMic className="w-4 h-4" />
              <span>Talk to AI</span>
            </button>
            
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-teal-300 hover:bg-gray-800 transition-colors"
              title="Save Itinerary as JSON"
              onClick={downloadItinerary}
            >
              <FiDownload className="w-4 h-4" />
              <span>Save JSON</span>
            </button>
            
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-blue-300 hover:bg-gray-800 transition-colors"
              title="Email Itinerary "
              onClick={emailItinerary}
              disabled={isEmailSending}
            >
              <FiMail className="w-4 h-4" />
              <span>{isEmailSending ? "Sending..." : "Email"}</span>
            </button>
            
            <div className="flex gap-2">
              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-green-400 hover:bg-gray-800 transition-colors"
                title="Share via WhatsApp"
              >
                <FaWhatsapp className="w-8 h-8" />
              </button>
              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-blue-400 hover:bg-gray-800 transition-colors"
                title="Share via Telegram"
              >
                <FaTelegram className="w-8 h-8" />
              </button>
              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-green-500 hover:bg-gray-800 transition-colors"
                title="Share via WeChat"
              >
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
    </div>
  );
}
