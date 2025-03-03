import { Stay } from "@/lib/types";
import { JSX } from "react";
import { FiHome, FiWifi, FiCoffee, FiCheckSquare } from "react-icons/fi";

interface StayCardProps {
  stay: Stay;
  selected?: boolean;
  onSelect?: () => void;
}

export default function StayCard({ stay, selected = false, onSelect }: StayCardProps) {
  // Common amenity icons
  const amenityIcons: Record<string, JSX.Element> = {
    'free wifi': <FiWifi className="w-3 h-3" />,
    'wifi': <FiWifi className="w-3 h-3" />,
    'breakfast': <FiCoffee className="w-3 h-3" />,
    'coffee': <FiCoffee className="w-3 h-3" />
  };

  const getIconForAmenity = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    for (const [key, icon] of Object.entries(amenityIcons)) {
      if (lowerAmenity.includes(key)) return icon;
    }
    return <FiCheckSquare className="w-3 h-3" />;
  };

  return (
    <div 
      className={`relative border backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 cursor-pointer card-hover ${
        selected 
          ? 'border-blue-500 bg-gray-900/90 shadow-lg shadow-blue-900/20' 
          : 'border-gray-800 bg-gray-900/70 hover:border-blue-800 hover:bg-gray-900/80'
      }`}
      onClick={onSelect}
    >
      {/* Price tag */}
      <div className="absolute top-0 right-0">
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          {stay.price}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-900/50 p-1.5 rounded-md text-blue-300">
            <FiHome className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-gray-100">{stay.name}</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {stay.description}
        </p>
        
        {stay.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800">
            {stay.amenities.map((amenity) => (
              <span 
                key={amenity} 
                className="flex items-center gap-1.5 text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-md"
              >
                {getIconForAmenity(amenity)}
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Highlight for selected state */}
      {selected && (
        <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-green-700"></div>
      )}
    </div>
  );
}
