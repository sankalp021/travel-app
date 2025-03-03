import { Transport } from "@/lib/types";
import { 
  FiTruck, FiNavigation2, FiBriefcase, FiAnchor, 
  FiTrendingUp, FiChevronsRight, FiDollarSign 
} from "react-icons/fi";

interface TransportCardProps {
  transport: Transport;
  selected?: boolean;
  onSelect?: () => void;
}

export default function TransportCard({ transport, selected = false, onSelect }: TransportCardProps) {
  // Get appropriate icon based on transport type
  const getTransportIcon = () => {
    const type = transport.type.toLowerCase();
    
    if (type.includes('bus') || type.includes('taxi') || type.includes('car') || type.includes('truck')) {
      return <FiTruck className="w-5 h-5" />;
    } else if (type.includes('boat') || type.includes('ferry')) {
      return <FiAnchor className="w-5 h-5" />;
    } else if (type.includes('train') || type.includes('subway')) {
      return <FiTrendingUp className="w-5 h-5" />;
    } else if (type.includes('walk') || type.includes('hike')) {
      return <FiBriefcase className="w-5 h-5" />;
    } else {
      return <FiNavigation2 className="w-5 h-5" />;
    }
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
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900/50 p-2 rounded-md text-indigo-300">
              {getTransportIcon()}
            </div>
            <h3 className="font-semibold text-gray-100">{transport.type}</h3>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-400">
            <FiDollarSign className="w-3.5 h-3.5 text-gray-500 mr-1" />
            {transport.cost}
          </div>
        </div>
        
        <p className="text-sm text-gray-400">
          {transport.description}
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-gray-900 via-indigo-900/10 to-gray-900 border-t border-gray-800 px-5 py-2 flex items-center justify-end">
        <span className="text-xs text-indigo-300 flex items-center gap-1 font-medium">
          More info <FiChevronsRight className="w-3.5 h-3.5" />
        </span>
      </div>
      
      {/* Highlight for selected state */}
      {selected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      )}
    </div>
  );
}
