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
  FiMail,
  FiX,
  FiInfo
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

interface UserContactInfo {
  name: string;
  email: string;
  phone: string;
}

type ShareSource = 'email' | 'telegram';

export default function ItineraryDisplay({ itinerary, onBack }: ItineraryDisplayProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'budget' | 'packing' | 'tips'>('schedule');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [shareSource, setShareSource] = useState<ShareSource>('email');
  const [contactInfo, setContactInfo] = useState<UserContactInfo>({
    name: '',
    email: '',
    phone: ''
  });

  // Telegram bot URL - replace with your actual chatbot URL
  const TELEGRAM_BOT_URL = "https://t.me/rbdesignflightassistantbot";

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

  // Handle opening the email modal
  const handleOpenEmailModal = (source: ShareSource = 'email') => {
    setShareSource(source);
    setIsEmailModalOpen(true);
  };

  // Handle input change for contact form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmitEmailForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          userContactInfo: contactInfo,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Itinerary sent successfully to ${contactInfo.email}`);
        setIsEmailModalOpen(false);
        
        // If the share source was Telegram, redirect to the Telegram bot
        if (shareSource === 'telegram') {
          window.open(TELEGRAM_BOT_URL, '_blank');
        }
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

  // Function to handle features under development
  const handleFeatureInDevelopment = (feature: string) => {
    alert(`The ${feature} sharing feature is currently under development and will be available soon.`);
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
            {/* <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-gray-300 hover:bg-gray-800 transition-colors"
              title="Talk to AI"
            >
              <FiMic className="w-4 h-4" />
              <span>Talk to AI</span>
            </button> */}
            
            {/* <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-teal-300 hover:bg-gray-800 transition-colors"
              title="Save Itinerary as JSON"
              onClick={downloadItinerary}
            >
              <FiDownload className="w-4 h-4" />
              <span>Save JSON</span>
            </button> */}
            
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-blue-300 hover:bg-gray-800 transition-colors"
              title="Email Itinerary"
              onClick={() => handleOpenEmailModal('email')}
              disabled={isEmailSending}
            >
              <FiMail className="w-8 h-8" />
            </button>
            
            <div className="flex gap-2">
              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-green-400/50 hover:bg-gray-800 transition-colors opacity-60  relative"
                title="WhatsApp sharing (coming soon)"
                onClick={() => handleFeatureInDevelopment("WhatsApp")}
              >
                <div className="absolute -bottom-1 -right-2 bg-gray-900 text-xs text-white px-1.5 py-0.5 rounded-full">X</div>
                <FaWhatsapp className="w-8 h-8" />
              </button>

              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-blue-400 hover:bg-gray-800 transition-colors"
                onClick={() => handleOpenEmailModal('telegram')}
                title="Chat with our Telegram Chatbot"
              >
                <FaTelegram className="w-8 h-8" />
              </button>

              <button 
                className="p-2 border border-gray-700 rounded-lg bg-gray-900/50 text-green-500/50 hover:bg-gray-800 transition-colors opacity-60 relative"
                title="WeChat sharing (coming soon)"
                onClick={() => handleFeatureInDevelopment("WeChat")}
              >
                <div className="absolute -bottom-2 -right-2 bg-gray-900 text-xs text-white px-1.5 py-0.5 rounded-full">X</div>
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

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                {shareSource === 'telegram' 
                  ? 'Share via Telegram & Email'
                  : 'Send Itinerary by Email'}
              </h2>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 mb-4">
              {shareSource === 'telegram'
                ? 'Please provide your contact information to receive the itinerary and connect with our Telegram chatbot.'
                : 'Please provide your contact information to receive the itinerary by email.'}
            </p>

            <form onSubmit={handleSubmitEmailForm}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isEmailSending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEmailSending 
                    ? "Sending..." 
                    : shareSource === 'telegram' 
                      ? "Send & Continue to Telegram" 
                      : "Send Itinerary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
