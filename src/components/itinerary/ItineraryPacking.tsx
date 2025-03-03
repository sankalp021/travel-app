import React, { useState } from "react";
import { PackingItem } from "@/lib/types";
import { FiCheck, FiShoppingBag } from "react-icons/fi";

interface ItineraryPackingProps {
  packingList: PackingItem[];
}

export default function ItineraryPacking({ packingList }: ItineraryPackingProps) {
  // State for tracking checked items
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Categories with icons
  const categoryIcons: Record<string, string> = {
    'Clothing': '👕',
    'Electronics': '📱',
    'Toiletries': '🧴',
    'Documents': '📄',
    'Health': '💊',
    'Miscellaneous': '🎒',
    'Accessories': '👓',
    'Outdoor': '🏕️',
  };
  
  const getDefaultIcon = (category: string) => {
    return categoryIcons[category] || '✅';
  };
  
  const toggleItem = (category: string, item: string) => {
    const itemKey = `${category}:${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };
  
  const isItemChecked = (category: string, item: string) => {
    const itemKey = `${category}:${item}`;
    return checkedItems[itemKey] || false;
  };
  
  // Calculate progress stats
  const totalItems = packingList.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;
  
  return (
    <div className="space-y-8">
      {/* Header and progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-200">Packing List</h2>
          <div className="text-sm text-gray-400">
            <span className="font-medium">{checkedCount}</span> of {totalItems} items packed
          </div>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Packing categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packingList.map((category, idx) => (
          <div 
            key={idx}
            className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 px-5 py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-xl" role="img" aria-label={category.category}>
                  {getDefaultIcon(category.category)}
                </span>
                <h3 className="font-medium text-gray-200">
                  {category.category} <span className="text-gray-500 text-sm">({category.items.length})</span>
                </h3>
              </div>
            </div>
            
            <div className="p-4">
              <ul className="space-y-2">
                {category.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-800/50 transition-colors">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isItemChecked(category.category, item) 
                          ? 'bg-amber-500 border-amber-500' 
                          : 'border-gray-600'
                      }`}>
                        {isItemChecked(category.category, item) && (
                          <FiCheck className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <input 
                        type="checkbox"
                        className="sr-only"
                        checked={isItemChecked(category.category, item)}
                        onChange={() => toggleItem(category.category, item)}
                      />
                      <span className={`text-sm ${
                        isItemChecked(category.category, item)
                          ? 'line-through text-gray-500'
                          : 'text-gray-300'
                      }`}>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      {/* Print and share buttons */}
      <div className="flex justify-center mt-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-700/20 border border-amber-700/30 rounded-lg text-amber-400 hover:bg-amber-700/30 transition-colors">
          <FiShoppingBag className="w-4 h-4" />
          <span>Create Shopping List</span>
        </button>
      </div>
    </div>
  );
}
