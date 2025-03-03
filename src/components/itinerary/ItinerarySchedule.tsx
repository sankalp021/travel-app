import React, { useState } from "react";
import { ItineraryDay } from "@/lib/types";
import { FiClock, FiMapPin, FiDollarSign, FiInfo } from "react-icons/fi";

interface ItineraryScheduleProps {
  schedule: ItineraryDay[];
}

export default function ItinerarySchedule({ schedule }: ItineraryScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  
  return (
    <div>
      {/* Day selector */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-200 mb-3">Day by Day Schedule</h2>
        
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {schedule.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`shrink-0 px-4 py-2 rounded-lg transition-colors ${
                selectedDay === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {day.date.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-[38px] w-0.5 bg-gradient-to-b from-blue-600/80 to-blue-600/20"></div>
        
        {schedule[selectedDay]?.activities.map((activity, index) => (
          <div key={index} className="relative flex gap-4 mb-8">
            {/* Time */}
            <div className="shrink-0 w-16 text-right font-medium text-blue-400 pt-0.5">
              {activity.time}
            </div>
            
            {/* Timeline dot */}
            <div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 border-4 border-gray-950 mt-1 z-10"></div>
            
            {/* Content card */}
            <div className="flex-grow">
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-lg text-gray-100">
                  {activity.activity}
                </h3>
                
                {activity.location && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <FiMapPin className="text-blue-400 shrink-0" />
                    <span>{activity.location}</span>
                  </div>
                )}
                
                {activity.cost && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <FiDollarSign className="text-green-400 shrink-0" />
                    <span>{activity.cost}</span>
                  </div>
                )}
                
                {activity.notes && (
                  <div className="flex gap-2 mt-3 text-sm text-gray-400">
                    <FiInfo className="text-amber-400 shrink-0 mt-1" />
                    <p>{activity.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Day end marker */}
        <div className="relative flex gap-4">
          <div className="shrink-0 w-16"></div>
          <div className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-b from-blue-600 to-purple-600 border-4 border-gray-950 mt-1 z-10"></div>
          <div className="flex-grow">
            <div className="bg-gradient-to-r from-gray-900/40 to-gray-900/20 border border-gray-800/50 rounded-xl p-3 text-center">
              <span className="text-sm text-gray-500">End of Day {selectedDay + 1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
