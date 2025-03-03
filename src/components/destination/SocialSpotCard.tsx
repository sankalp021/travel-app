import { SocialSpot } from "@/lib/types";
import { 
  FiUsers, FiMusic, FiGlobe, FiAlertCircle, 
  FiCalendar, FiMapPin, FiCoffee 
} from "react-icons/fi";
import { BiWine } from "react-icons/bi";

interface SocialSpotCardProps {
  spot: SocialSpot;
  selected?: boolean;
  onSelect?: () => void;
}

export default function SocialSpotCard({ spot, selected = false, onSelect }: SocialSpotCardProps) {
  // Get appropriate icon based on social spot type
  const getSpotTypeIcon = () => {
    const type = spot.type.toLowerCase();
    if (type.includes('bar') || type.includes('pub')) {
      return <BiWine className="w-4 h-4" />;
      
    } else if (type.includes('cafe') || type.includes('coffee')) {
      return <FiCoffee className="w-4 h-4" />;
    } else if (type.includes('event') || type.includes('festival')) {
      return <FiCalendar className="w-4 h-4" />;
    } else if (type.includes('club')) {
      return <FiMusic className="w-4 h-4" />;
    } else if (type.includes('meetup')) {
      return <FiUsers className="w-4 h-4" />;
    } else {
      return <FiGlobe className="w-4 h-4" />;
    }
  };
  
  // Get type color based on social spot type
  const getSpotTypeColor = () => {
    const type = spot.type.toLowerCase();
    
    if (type.includes('bar') || type.includes('pub')) {
      return 'bg-amber-950/60 text-amber-300 border border-amber-800/30';
    } else if (type.includes('cafe')) {
      return 'bg-brown-950/60 text-yellow-300 border border-yellow-800/30';
    } else if (type.includes('event') || type.includes('festival')) {
      return 'bg-purple-950/60 text-purple-300 border border-purple-800/30';
    } else if (type.includes('club') || type.includes('nightlife')) {
      return 'bg-blue-950/60 text-blue-300 border border-blue-800/30';
    } else if (type.includes('meetup')) {
      return 'bg-red-950/60 text-red-300 border border-red-800/30';
    } else {
      return 'bg-gray-800 text-gray-300 border border-gray-700';
    }
  };

  const icon = getSpotTypeIcon();
  const typeColor = getSpotTypeColor();

  return (
    <div 
      className={`relative border backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 cursor-pointer card-hover ${
        selected 
          ? 'border-blue-500 bg-gray-900/90 shadow-lg shadow-purple-900/20' 
          : 'border-gray-800 bg-gray-900/70 hover:border-purple-800 hover:bg-gray-900/80'
      }`}
      onClick={onSelect}
    >
      {/* Social vibe indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <span className="block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
        <span className="block w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-100"></span>
        <span className="block w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-200"></span>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-gray-100 mb-2">{spot.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${typeColor}`}>
            {icon}
            {spot.type}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <FiMapPin className="w-3 h-3" />
            Local spot
          </span>
        </div>
        
        <p className="text-sm text-gray-400 line-clamp-3">
          {spot.description}
        </p>
      </div>
      
      {/* Backpacker tip */}
      <div className="px-5 py-3 bg-purple-900/20 border-t border-gray-800 flex items-center gap-2">
        <FiAlertCircle className="text-purple-400 w-4 h-4 flex-shrink-0" />
        <p className="text-xs text-purple-300">
          Great place to meet fellow backpackers
        </p>
      </div>
      
      {/* Highlight for selected state */}
      {selected && (
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-fuchsia-600"></div>
      )}
    </div>
  );
}
