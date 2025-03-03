"use client";

import { useState } from "react";
import { DestinationData } from "@/lib/types";
import ActivityCard from "./ActivityCard";
import StayCard from "./StayCard";
import TransportCard from "./TransportCard";
import SocialSpotCard from "./SocialSpotCard";
import { FiActivity, FiHome, FiNavigation2, FiUsers, FiArrowLeft } from "react-icons/fi";

interface DestinationResultsProps {
  destination: string;
  data: DestinationData;
  onReset: () => void;
}

export default function DestinationResults({ 
  destination, 
  data, 
  onReset 
}: DestinationResultsProps) {
  const [activeTab, setActiveTab] = useState<'activities' | 'stays' | 'transport' | 'social'>('activities');
  
  // Group activities by category
  const activityCategories: Record<string, typeof data.activities> = {};
  data.activities.forEach(activity => {
    if (!activityCategories[activity.category]) {
      activityCategories[activity.category] = [];
    }
    activityCategories[activity.category].push(activity);
  });

  // Enhanced tab styling
  const tabBaseClasses = "flex items-center gap-2 px-5 py-3.5 font-medium rounded-xl transition-all duration-200";
  const activeTabClasses = "bg-gradient-to-r from-blue-800/90 to-blue-900/80 text-blue-100 shadow-lg shadow-blue-900/30";
  const inactiveTabClasses = "bg-gray-900/40 text-gray-400 border border-gray-800/60 hover:bg-gray-800/60 hover:text-gray-300";

  return (
    <div className="backdrop-blur-sm bg-gray-950/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 text-sm px-3 py-1.5 rounded-full mb-3">
            <span className="block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Backpacker Guide
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
            Exploring {destination}
          </h2>
        </div>
        
        <button 
          onClick={onReset}
          className="group flex items-center gap-2 px-4 py-2.5 text-sm border border-gray-800 bg-gray-900/50 rounded-lg hover:bg-gray-800/80 transition-colors"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
          Change destination
        </button>
      </div>
      
      {/* Enhanced tab navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <button 
          className={`${tabBaseClasses} ${activeTab === 'activities' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('activities')}
        >
          <FiActivity className={`${activeTab === 'activities' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Things to do <span className="text-xs opacity-80">({data.activities.length})</span></span>
        </button>
        <button 
          className={`${tabBaseClasses} ${activeTab === 'stays' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('stays')}
        >
          <FiHome className={`${activeTab === 'stays' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Places to stay <span className="text-xs opacity-80">({data.stays.length})</span></span>
        </button>
        <button 
          className={`${tabBaseClasses} ${activeTab === 'transport' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('transport')}
        >
          <FiNavigation2 className={`${activeTab === 'transport' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Getting around <span className="text-xs opacity-80">({data.transport.length})</span></span>
        </button>
        <button 
          className={`${tabBaseClasses} ${activeTab === 'social' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('social')}
        >
          <FiUsers className={`${activeTab === 'social' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Meet travelers <span className="text-xs opacity-80">({data.socialSpots.length})</span></span>
        </button>
      </div>

      {/* Content sections with subtle animations */}
      <div className="transition-all duration-300">
        {activeTab === 'activities' && (
          <div className="space-y-8 animate-fadeIn">
            {Object.entries(activityCategories).map(([category, activities]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200 border-b border-gray-800 pb-2">
                  {category} <span className="text-gray-500 text-sm">({activities.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activities.map((activity) => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'stays' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {data.stays.map((stay) => (
              <StayCard 
                key={stay.id} 
                stay={stay}
              />
            ))}
          </div>
        )}
        
        {activeTab === 'transport' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {data.transport.map((item) => (
              <TransportCard 
                key={item.id} 
                transport={item}
              />
            ))}
          </div>
        )}
        
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {data.socialSpots.map((spot) => (
              <SocialSpotCard 
                key={spot.id} 
                spot={spot}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
