import { useState } from "react";
import { Activity, Stay, Transport, SocialSpot, DestinationData } from "@/lib/types";
import ActivityCard from "@/components/destination/ActivityCard";
import StayCard from "@/components/destination/StayCard";
import TransportCard from "@/components/destination/TransportCard";
import SocialSpotCard from "@/components/destination/SocialSpotCard";
import { FiActivity, FiHome, FiNavigation2, FiUsers } from "react-icons/fi";

interface ActivitySelectionProps {
  destinationData: DestinationData;
  selectedActivities: Activity[];
  selectedStays: Stay[];
  selectedTransport: Transport[];
  selectedSocialSpots: SocialSpot[];
  onSelectActivity: (activity: Activity) => void;
  onSelectStay: (stay: Stay) => void;
  onSelectTransport: (transport: Transport) => void;
  onSelectSocialSpot: (spot: SocialSpot) => void;
}

export default function ActivitySelection({
  destinationData,
  selectedActivities,
  selectedStays,
  selectedTransport,
  selectedSocialSpots,
  onSelectActivity,
  onSelectStay,
  onSelectTransport,
  onSelectSocialSpot,
}: ActivitySelectionProps) {
  const [activeTab, setActiveTab] = useState<'activities' | 'stays' | 'transport' | 'social'>('activities');
  
  // Group activities by category
  const activityCategories: Record<string, Activity[]> = {};
  destinationData.activities.forEach(activity => {
    if (!activityCategories[activity.category]) {
      activityCategories[activity.category] = [];
    }
    activityCategories[activity.category].push(activity);
  });

  // Enhanced tab styling
  const tabBaseClasses = "flex items-center gap-2 px-5 py-3.5 font-medium rounded-xl transition-all duration-200";
  const activeTabClasses = "bg-gradient-to-r from-blue-800/90 to-blue-900/80 text-blue-100 shadow-lg shadow-blue-900/30";
  const inactiveTabClasses = "bg-gray-900/40 text-gray-400 border border-gray-800/60 hover:bg-gray-800/60 hover:text-gray-300";

  // Counter for selections
  const getSelectionCount = () => {
    return {
      activities: selectedActivities.length,
      stays: selectedStays.length,
      transport: selectedTransport.length,
      social: selectedSocialSpots.length,
      total: selectedActivities.length + selectedStays.length + selectedTransport.length + selectedSocialSpots.length
    };
  };

  const selectionCount = getSelectionCount();

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 mb-6">
        <h3 className="text-blue-300 font-medium mb-2">Your Selections</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-blue-900/40 text-blue-200 px-3 py-1.5 rounded-full text-sm">
            <FiActivity className="w-4 h-4" />
            <span>{selectionCount.activities} Activities</span>
          </div>
          <div className="flex items-center gap-2 bg-green-900/40 text-green-200 px-3 py-1.5 rounded-full text-sm">
            <FiHome className="w-4 h-4" />
            <span>{selectionCount.stays} Stay</span>
          </div>
          <div className="flex items-center gap-2 bg-indigo-900/40 text-indigo-200 px-3 py-1.5 rounded-full text-sm">
            <FiNavigation2 className="w-4 h-4" />
            <span>{selectionCount.transport} Transportation</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-900/40 text-purple-200 px-3 py-1.5 rounded-full text-sm">
            <FiUsers className="w-4 h-4" />
            <span>{selectionCount.social} Social Spots</span>
          </div>
        </div>
        {selectionCount.total === 0 && (
          <p className="text-gray-400 text-sm mt-2">
            Select at least a few items to build your ideal trip. We recommend choosing activities, a place to stay, and transportation.
          </p>
        )}
      </div>

      {/* Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button 
          className={`${tabBaseClasses} ${activeTab === 'activities' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('activities')}
        >
          <FiActivity className={`${activeTab === 'activities' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Activities <span className="text-xs opacity-80">({destinationData.activities.length})</span></span>
        </button>
        <button 
          className={`${tabBaseClasses} ${activeTab === 'stays' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('stays')}
        >
          <FiHome className={`${activeTab === 'stays' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Stays <span className="text-xs opacity-80">({destinationData.stays.length})</span></span>
        </button>
        <button 
          className={`${tabBaseClasses} ${activeTab === 'transport' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('transport')}
        >
          <FiNavigation2 className={`${activeTab === 'transport' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Transport <span className="text-xs opacity-80">({destinationData.transport.length})</span></span>
        </button>
        <button 
          className={`${tabBaseClasses} ${activeTab === 'social' ? activeTabClasses : inactiveTabClasses}`}
          onClick={() => setActiveTab('social')}
        >
          <FiUsers className={`${activeTab === 'social' ? 'text-blue-300' : 'text-gray-500'}`} />
          <span>Social <span className="text-xs opacity-80">({destinationData.socialSpots.length})</span></span>
        </button>
      </div>

      {/* Content sections */}
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
                      selected={selectedActivities.some(a => a.id === activity.id)}
                      onSelect={() => onSelectActivity(activity)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'stays' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {destinationData.stays.map((stay) => (
              <StayCard 
                key={stay.id} 
                stay={stay}
                selected={selectedStays.some(s => s.id === stay.id)}
                onSelect={() => onSelectStay(stay)}
              />
            ))}
          </div>
        )}
        
        {activeTab === 'transport' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {destinationData.transport.map((transport) => (
              <TransportCard 
                key={transport.id} 
                transport={transport}
                selected={selectedTransport.some(t => t.id === transport.id)}
                onSelect={() => onSelectTransport(transport)}
              />
            ))}
          </div>
        )}
        
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {destinationData.socialSpots.map((spot) => (
              <SocialSpotCard 
                key={spot.id} 
                spot={spot}
                selected={selectedSocialSpots.some(s => s.id === spot.id)}
                onSelect={() => onSelectSocialSpot(spot)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-900/10 border border-blue-800/20 rounded-lg p-4 mt-6">
        <p className="text-gray-300 text-sm">
          <span className="text-blue-400 font-medium">Tip:</span> Select items that interest you most. Your AI-generated itinerary will incorporate these preferences.
        </p>
      </div>
    </div>
  );
}
