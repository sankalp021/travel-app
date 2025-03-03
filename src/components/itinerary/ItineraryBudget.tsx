import React, { JSX } from "react";
import { BudgetBreakdown } from "@/lib/types";
import { 
  FiHome, 
  FiCoffee, 
  FiActivity, 
  FiNavigation2, 
  FiPackage, 
  FiDollarSign 
} from "react-icons/fi";

interface ItineraryBudgetProps {
  budget: BudgetBreakdown;
}

export default function ItineraryBudget({ budget }: ItineraryBudgetProps) {
  // Parse budget values for visualization
  const parseCost = (cost: string): number => {
    const numericValue = parseFloat(cost.replace(/[^0-9.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  };
  
  const categories = [
    { 
      name: 'Accommodation', 
      value: parseCost(budget.accommodation.totalCost), 
      displayValue: budget.accommodation.totalCost,
      icon: <FiHome className="w-5 h-5" />,
      color: 'bg-blue-500',
      details: budget.accommodation.details,
      perDay: budget.accommodation.perNight
    },
    { 
      name: 'Food', 
      value: parseCost(budget.food.totalCost), 
      displayValue: budget.food.totalCost,
      icon: <FiCoffee className="w-5 h-5" />,
      color: 'bg-green-500',
      details: budget.food.details,
      perDay: budget.food.perDay
    },
    { 
      name: 'Activities', 
      value: parseCost(budget.activities.totalCost),
      displayValue: budget.activities.totalCost,
      icon: <FiActivity className="w-5 h-5" />,
      color: 'bg-purple-500',
      details: budget.activities.details.join(', ')
    },
    { 
      name: 'Transportation', 
      value: parseCost(budget.transportation.totalCost), 
      displayValue: budget.transportation.totalCost,
      icon: <FiNavigation2 className="w-5 h-5" />,
      color: 'bg-amber-500',
      details: budget.transportation.details.join(', ')
    },
    { 
      name: 'Miscellaneous', 
      value: parseCost(budget.miscellaneous.totalCost), 
      displayValue: budget.miscellaneous.totalCost,
      icon: <FiPackage className="w-5 h-5" />,
      color: 'bg-red-500',
      details: budget.miscellaneous.details.join(', ')
    }
  ];
  
  const totalBudget = parseCost(budget.totalBudget);
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-200 mb-3">Budget Overview</h2>
        
        {/* Total budget summary */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-900/50 text-green-400 rounded-lg">
                <FiDollarSign className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Budget</div>
                <div className="text-2xl font-bold text-green-400">{budget.totalBudget}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Accommodation / night</div>
                <div className="text-lg font-medium text-blue-400">{budget.accommodation.perNight}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Food / day</div>
                <div className="text-lg font-medium text-green-400">{budget.food.perDay}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Budget breakdown chart */}
      <div>
        <h3 className="font-medium text-gray-300 mb-3">Budget Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visualization */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <div className="flex justify-center">
              {/* Budget visualization chart - using a simple bar chart here */}
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {categories.reduce((acc, category, i) => {
                    // Calculate pie chart segments
                    const percentage = (category.value / totalBudget) * 100;
                    const previousPercentage = acc.prevPercentage;
                    acc.prevPercentage += percentage;
                    
                    // SVG arc path calculation
                    const radius = 35;
                    const startX = 50 + radius * Math.cos(2 * Math.PI * previousPercentage / 100);
                    const startY = 50 + radius * Math.sin(2 * Math.PI * previousPercentage / 100);
                    const endX = 50 + radius * Math.cos(2 * Math.PI * acc.prevPercentage / 100);
                    const endY = 50 + radius * Math.sin(2 * Math.PI * acc.prevPercentage / 100);
                    
                    // Large arc flag is 0 for arcs <180 degrees, 1 for arcs >180 degrees
                    const largeArcFlag = percentage > 50 ? 1 : 0;
                    
                    acc.segments.push(
                      <path 
                        key={i}
                        d={`M 50 50 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                        fill={category.color}
                        stroke="#111"
                        strokeWidth="0.5"
                        className="hover:opacity-90 transition-opacity"
                      />
                    );
                    return acc;
                  }, { segments: [] as JSX.Element[], prevPercentage: 0 }).segments}
                  <circle cx="50" cy="50" r="20" fill="#111827" />
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center rotate-90">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-200">{budget.totalBudget}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${category.color}`}></div>
                  <div className="text-xs text-gray-400">
                    {category.name} ({category.displayValue})
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Detailed breakdown */}
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="bg-gray-900/40 border border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-opacity-20 text-opacity-90 ${category.color.replace('bg-', 'bg-opacity-20 text-')}`}>
                      {category.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-300">
                        {category.name}
                      </div>
                      {category.perDay && (
                        <div className="text-xs text-gray-500">
                          {category.perDay} per day/night
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-medium">{category.displayValue}</div>
                </div>
                {category.details && (
                  <div className="mt-2 text-xs text-gray-500">
                    {category.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
