import React from "react";
import { LocalTip } from "@/lib/types";
import { 
  FiMapPin, 
  FiNavigation2, 
  FiAlertTriangle, 
  FiGlobe, 
  FiInfo,
  FiStar,
  FiShield
} from "react-icons/fi";

interface ItineraryTipsProps {
  localTips: LocalTip[];
  transportRecommendations: string[];
}

export default function ItineraryTips({ 
  localTips, 
  transportRecommendations 
}: ItineraryTipsProps) {
  // Group tips by category
  const tipsByCategory: Record<string, LocalTip[]> = {};
  localTips.forEach(tip => {
    if (!tipsByCategory[tip.category]) {
      tipsByCategory[tip.category] = [];
    }
    tipsByCategory[tip.category].push(tip);
  });
  
  // Get appropriate icon for tip category
  const getTipIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('secret') || lowerCategory.includes('hidden')) {
      return <FiStar className="w-5 h-5" />;
    } else if (lowerCategory.includes('cultural') || lowerCategory.includes('local')) {
      return <FiGlobe className="w-5 h-5" />;
    } else if (lowerCategory.includes('safety') || lowerCategory.includes('warning')) {
      return <FiShield className="w-5 h-5" />;
    } else {
      return <FiInfo className="w-5 h-5" />;
    }
  };
  
  // Get color scheme for tip category
  const getTipColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('secret') || lowerCategory.includes('hidden')) {
      return 'bg-purple-900/30 text-purple-400 border-purple-800/30';
    } else if (lowerCategory.includes('cultural') || lowerCategory.includes('local')) {
      return 'bg-blue-900/30 text-blue-400 border-blue-800/30';
    } else if (lowerCategory.includes('safety') || lowerCategory.includes('warning')) {
      return 'bg-red-900/30 text-red-400 border-red-800/30';
    } else {
      return 'bg-gray-900/30 text-gray-400 border-gray-800/30';
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Local tips section */}
      <div>
        <h2 className="text-xl font-bold text-gray-200 mb-4">Local Tips & Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tips by category */}
          {Object.entries(tipsByCategory).map(([category, tips]) => (
            <div 
              key={category}
              className={`border rounded-xl overflow-hidden ${getTipColor(category)}`}
            >
              <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <div className={`p-2 rounded-md ${getTipColor(category)}`}>
                  {getTipIcon(category)}
                </div>
                <h3 className="font-medium">
                  {category} <span className="text-sm opacity-70">({tips.length})</span>
                </h3>
              </div>
              
              <div className="p-4">
                <ul className="space-y-4">
                  {tips.map((tip, index) => (
                    <li key={index} className="space-y-1">
                      <h4 className="font-medium">{tip.title}</h4>
                      <p className="text-sm opacity-80">{tip.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Transport recommendations */}
      <div>
        <h2 className="text-xl font-bold text-gray-200 mb-4">Transportation Tips</h2>
        
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-900/30 text-indigo-400">
              <FiNavigation2 className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-200">Getting Around Efficiently</h3>
          </div>
          
          <div className="p-4">
            <ul className="space-y-2">
              {transportRecommendations.map((recommendation, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-gray-300"
                >
                  <FiMapPin className="text-indigo-400 mt-1 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Safety notice */}
      <div className="bg-red-900/20 border border-red-900/30 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 rounded-md bg-red-900/30 text-red-400">
          <FiAlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-red-300 mb-1">Safety First</h3>
          <p className="text-sm text-red-200/70">
            These recommendations are AI-generated. Always double-check safety information, 
            transportation schedules, and prices with official sources before making decisions.
          </p>
        </div>
      </div>
    </div>
  );
}