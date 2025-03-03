import React, { JSX } from 'react';
import { Activity } from "@/lib/types";
import { FiCamera, FiMapPin, FiCompass, FiCoffee, FiMusic } from "react-icons/fi";

interface ActivityCardProps {
  activity: Activity;
  selected?: boolean;
  onSelect?: () => void;
}

export default function ActivityCard({ activity, selected = false, onSelect }: ActivityCardProps) {
  // Map category to icons
  const categoryIcons: Record<string, JSX.Element> = {
    'Cultural': <FiCamera className="w-4 h-4" />,
    'Adventure': <FiCompass className="w-4 h-4" />,
    'Nature': <FiMapPin className="w-4 h-4" />,
    'Food': <FiCoffee className="w-4 h-4" />,
    'Nightlife': <FiMusic className="w-4 h-4" />,
  };

  // Category styling
  const categoryColors: Record<string, string> = {
    'Cultural': 'bg-purple-950/60 text-purple-300 border border-purple-800/30',
    'Adventure': 'bg-red-950/60 text-red-300 border border-red-800/30',
    'Nature': 'bg-green-950/60 text-green-300 border border-green-800/30',
    'Food': 'bg-amber-950/60 text-amber-300 border border-amber-800/30',
    'Nightlife': 'bg-blue-950/60 text-blue-300 border border-blue-800/30',
  };

  const categoryColor = categoryColors[activity.category] || 'bg-gray-800 text-gray-300 border border-gray-700';
  const icon = categoryIcons[activity.category] || null;
  
  return (
    <div 
      className={`relative border backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
        selected 
          ? 'border-blue-500 bg-gray-900/90 shadow-lg shadow-blue-900/20' 
          : 'border-gray-800 bg-gray-900/70 hover:border-blue-800 hover:bg-gray-900/80'
      }`}
      onClick={onSelect}
    >
      {/* Glowing effect for selected cards */}
      {selected && (
        <div className="absolute inset-0 -z-10 bg-blue-900/10 blur-md rounded-xl"></div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-100">{activity.name}</h3>
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${categoryColor}`}>
            {icon}
            {activity.category}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-400 line-clamp-3">
          {activity.description}
        </p>
      </div>
      
      {/* Highlight bar at bottom for selected cards */}
      {selected && (
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      )}
    </div>
  );
}
