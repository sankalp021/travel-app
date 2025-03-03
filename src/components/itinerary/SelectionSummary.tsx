import React from "react";
import { Activity, Stay, Transport, SocialSpot } from "@/lib/types";
import { 
  FiMapPin, FiHome, FiNavigation2, FiUsers, 
  FiCheckCircle, FiClock, FiCalendar 
} from "react-icons/fi";

interface SelectionSummaryProps {
  destination: string;
  selectedActivities: Activity[];
  selectedStay: Stay | null;
  selectedTransport: Transport[];
  selectedSocialSpots: SocialSpot[];
}

export default function SelectionSummary({
  destination,
  selectedActivities,
  selectedStay,
  selectedTransport,
  selectedSocialSpots,
}: SelectionSummaryProps) {
  // Group activities by category
  const activityCategories: Record<string, Activity[]> = {};
  selectedActivities.forEach(activity => {
    if (!activityCategories[activity.category]) {
      activityCategories[activity.category] = [];
    }
    activityCategories[activity.category].push(activity);
  });
  
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-900/20 text-blue-300 text-sm px-3 py-1.5 rounded-full mb-2">
          <FiCheckCircle className="w-4 h-4" />
          Step 5 of 5
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-100">Review Your Selections</h2>
        <p className="text-gray-400">
          Review your selections for your trip to {destination} before we create your personalized itinerary.
        </p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activities summary */}
        <div className="border border-gray-800 bg-gray-900/50 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 px-5 py-3 flex items-center gap-3">
            <div className="bg-blue-900/60 p-2 rounded-md text-blue-300">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Activities</h3>
              <p className="text-xs text-gray-400">
                {selectedActivities.length} activities selected
              </p>
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            {Object.entries(activityCategories).map(([category, activities]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {category} ({activities.length})
                </h4>
                <ul className="space-y-2">
                  {activities.map(activity => (
                    <li 
                      key={activity.id}
                      className="text-sm text-gray-400 flex items-start gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{activity.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            {selectedActivities.length === 0 && (
              <div className="text-sm text-gray-500 italic">No activities selected</div>
            )}
          </div>
        </div>
        
        {/* Accommodation summary */}
        <div className="border border-gray-800 bg-gray-900/50 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 px-5 py-3 flex items-center gap-3">
            <div className="bg-green-900/60 p-2 rounded-md text-green-300">
              <FiHome className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Accommodation</h3>
              <p className="text-xs text-gray-400">
                {selectedStay ? "1 accommodation selected" : "No accommodation selected"}
              </p>
            </div>
          </div>
          
          <div className="p-5">
            {selectedStay ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">{selectedStay.name}</h4>
                <p className="text-sm text-gray-400">{selectedStay.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">{selectedStay.price}</span>
                  <span className="text-gray-500">
                    {selectedStay.amenities.length} amenities included
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No accommodation selected. We'll recommend options in your itinerary.
              </div>
            )}
          </div>
        </div>
        
        {/* Transport summary */}
        <div className="border border-gray-800 bg-gray-900/50 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 px-5 py-3 flex items-center gap-3">
            <div className="bg-indigo-900/60 p-2 rounded-md text-indigo-300">
              <FiNavigation2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Transport Options</h3>
              <p className="text-xs text-gray-400">
                {selectedTransport.length} transport options selected
              </p>
            </div>
          </div>
          
          <div className="p-5">
            {selectedTransport.length > 0 ? (
              <ul className="space-y-2">
                {selectedTransport.map(transport => (
                  <li 
                    key={transport.id}
                    className="text-sm text-gray-400 flex items-start gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-300">{transport.type}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {transport.cost}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 italic">No transport options selected</div>
            )}
          </div>
        </div>
        
        {/* Social spots summary */}
        <div className="border border-gray-800 bg-gray-900/50 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-900/30 to-fuchsia-900/30 px-5 py-3 flex items-center gap-3">
            <div className="bg-purple-900/60 p-2 rounded-md text-purple-300">
              <FiUsers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Social Spots</h3>
              <p className="text-xs text-gray-400">
                {selectedSocialSpots.length} social spots selected
              </p>
            </div>
          </div>
          
          <div className="p-5">
            {selectedSocialSpots.length > 0 ? (
              <ul className="space-y-2">
                {selectedSocialSpots.map(spot => (
                  <li 
                    key={spot.id}
                    className="text-sm text-gray-400 flex items-start gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-300">{spot.name}</span>
                      <span className="bg-purple-900/40 text-purple-400 text-xs px-1.5 py-0.5 rounded ml-2">
                        {spot.type}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 italic">No social spots selected</div>
            )}
          </div>
        </div>
        
        {/* Estimated planning time */}
        <div className="md:col-span-2 border border-gray-800 bg-gray-900/50 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 px-5 py-3 flex items-center gap-3">
            <div className="bg-amber-900/60 p-2 rounded-md text-amber-300">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">Ready to Generate</h3>
              <p className="text-xs text-gray-400">
                AI will use your selections to create a personalized itinerary
              </p>
            </div>
          </div>
          
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-sm text-gray-300">Estimated time to generate your itinerary</div>
                <div className="text-xs text-gray-500">Based on your selections</div>
              </div>
            </div>
            <div className="text-amber-400 font-medium">~45 seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
}
