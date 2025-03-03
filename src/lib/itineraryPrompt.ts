import { UserSelections, ItineraryResult } from "./types";

/**
 * Builds a structured prompt for generating the schedule part of the itinerary
 */
export function buildSchedulePrompt(selections: UserSelections): string {
  const { destination, selectedActivities, selectedStay, selectedTransport, preferences } = selections;
  
  // Calculate trip duration in days
  const startDate = new Date(preferences.startDate);
  const endDate = new Date(preferences.endDate);
  const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  
  // Format activities by category for better organization
  const activitiesByCategory: Record<string, string[]> = {};
  selectedActivities.forEach(activity => {
    if (!activitiesByCategory[activity.category]) {
      activitiesByCategory[activity.category] = [];
    }
    activitiesByCategory[activity.category].push(activity.name);
  });
  
  // Format the prompt for schedule generation
  return `
Generate ONLY a daily schedule for a ${tripDuration}-day travel itinerary for ${destination}.

TRIP DETAILS:
- Destination: ${destination}
- Date Range: ${preferences.startDate} to ${preferences.endDate} (${tripDuration} days)
- Budget Level: ${preferences.budgetLevel}
- Travel Style: ${preferences.travelStyle}
- Interests: ${preferences.interests.join(', ')}

SELECTED ACTIVITIES:
${Object.entries(activitiesByCategory).map(([category, activities]) => 
  `- ${category}: ${activities.join(', ')}`
).join('\n')}

ACCOMMODATION:
${selectedStay ? `${selectedStay.name}` : 'Budget backpacker options'}

TRANSPORTATION OPTIONS:
${selectedTransport.map(t => t.type).join(', ')}

Create a day-by-day schedule with times, activities, locations, and estimated costs.
Each day should include morning, afternoon, and evening activities.
Make it realistic for a backpacker with the specified budget level.

Return ONLY a valid JSON object in this exact format:
{
  "destination": "${destination}",
  "summary": "Brief 1-2 sentence summary",
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "08:00",
          "activity": "Activity name",
          "location": "Location name",
          "cost": "$XX"
        }
      ]
    }
  ]
}
`;
}

/**
 * Builds a structured prompt for generating the budget part of the itinerary
 */
export function buildBudgetPrompt(selections: UserSelections, schedule: any): string {
  const { destination, selectedStay, selectedTransport, preferences } = selections;
  
  // Calculate trip duration in days
  const startDate = new Date(preferences.startDate);
  const endDate = new Date(preferences.endDate);
  const tripDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  
  return `
Based on the following schedule for a ${tripDuration}-day trip to ${destination}, create a detailed budget breakdown.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${tripDuration} days
- Budget Level: ${preferences.budgetLevel}
- Accommodation: ${selectedStay ? selectedStay.name : 'Budget backpacker options'}
- Transportation: ${selectedTransport.map(t => t.type).join(', ')}

SCHEDULE SUMMARY:
${JSON.stringify(schedule, null, 2).substring(0, 500)}...

Create a realistic budget breakdown for a backpacker with the specified budget level.
Include costs for accommodation, food, activities, transportation, and miscellaneous expenses.

Return ONLY a valid JSON object in this exact format:
{
  "budget": {
    "accommodation": {
      "totalCost": "$XXX",
      "perNight": "$XX",
      "details": "Brief explanation"
    },
    "food": {
      "totalCost": "$XXX",
      "perDay": "$XX",
      "details": "Brief explanation"
    },
    "activities": {
      "totalCost": "$XXX",
      "details": ["Item 1: $XX", "Item 2: $XX"]
    },
    "transportation": {
      "totalCost": "$XXX",
      "details": ["Item 1: $XX", "Item 2: $XX"]
    },
    "miscellaneous": {
      "totalCost": "$XXX",
      "details": ["Item 1: $XX", "Item 2: $XX"]
    },
    "totalBudget": "$XXXX"
  }
}
`;
}

/**
 * Builds a structured prompt for generating local tips for the itinerary
 */
export function buildTipsPrompt(selections: UserSelections): string {
  const { destination, preferences } = selections;
  
  return `
You are a travel expert specializing in ${destination}.
Create a list of 5-7 helpful tips for a backpacker visiting ${destination}.

TRAVELER PROFILE:
- Budget Level: ${preferences.budgetLevel}
- Travel Style: ${preferences.travelStyle}
- Interests: ${preferences.interests.join(', ')}

Focus on providing unique, specific insights about:
- Local customs and etiquette
- Safety tips
- Money-saving advice
- Transportation hacks
- Food recommendations
- Common tourist mistakes to avoid

Return ONLY a valid JSON object in this exact format:
{
  "localTips": [
    {
      "title": "Tip title",
      "description": "Detailed explanation of the tip (1-2 sentences)",
      "category": "One of: Cultural, Safety, Food, Transportation, Money, Practical"
    }
  ],
  "transportRecommendations": [
    "Specific transportation tip 1",
    "Specific transportation tip 2",
    "Specific transportation tip 3"
  ]
}
`;
}

/**
 * Generate default packing list based on destination and preferences
 */
export function getDefaultPackingList(destination: string, preferences: any) {
  // Basic packing list categories that apply to most destinations
  const basicPackingList = [
    {
      category: "Documents",
      items: [
        "Passport and visa (if required)",
        "Travel insurance documents",
        "Booking confirmations",
        "Emergency contacts",
        "Backup ID",
        "Credit/debit cards"
      ]
    },
    {
      category: "Clothing Essentials",
      items: [
        "Underwear and socks",
        "T-shirts/tops",
        "Lightweight pants/shorts",
        "Comfortable walking shoes",
        "Light jacket or sweater",
        "Sleep clothes"
      ]
    },
    {
      category: "Toiletries",
      items: [
        "Toothbrush and toothpaste",
        "Shampoo and soap",
        "Deodorant",
        "Sunscreen",
        "Hand sanitizer",
        "Basic first aid supplies"
      ]
    },
    {
      category: "Technology",
      items: [
        "Smartphone and charger",
        "Camera (optional)",
        "Power adapter",
        "Portable battery pack",
        "Headphones"
      ]
    },
    {
      category: "Backpacker Essentials",
      items: [
        "Reusable water bottle",
        "Day pack",
        "Lock for hostel lockers",
        "Quick-dry towel",
        "Eye mask and earplugs",
        "Multi-tool or pocket knife"
      ]
    }
  ];
  
  return basicPackingList;
}

/**
 * Completes the itinerary by merging all the parts
 */
export function mergeItineraryParts(schedulePart: any, budgetPart: any, tipsPart: any, selections: UserSelections): ItineraryResult {
  const packingList = getDefaultPackingList(selections.destination, selections.preferences);
  
  // Create the complete itinerary by merging all parts
  const completeItinerary: ItineraryResult = {
    destination: schedulePart.destination || selections.destination,
    summary: schedulePart.summary || `A ${selections.preferences.budgetLevel} trip to ${selections.destination}.`,
    schedule: schedulePart.schedule || [],
    budget: budgetPart.budget || {
      accommodation: { totalCost: "N/A", perNight: "N/A", details: "Budget accommodation" },
      food: { totalCost: "N/A", perDay: "N/A", details: "Local food options" },
      activities: { totalCost: "N/A", details: ["Various activities"] },
      transportation: { totalCost: "N/A", details: ["Local transportation"] },
      miscellaneous: { totalCost: "N/A", details: ["Miscellaneous expenses"] },
      totalBudget: "N/A"
    },
    packingList: packingList,
    localTips: tipsPart.localTips || [],
    transportRecommendations: tipsPart.transportRecommendations || [
      "Use public transportation when possible to save money",
      "Consider walking for short distances",
      "Research transportation passes for better value"
    ]
  };
  
  return completeItinerary;
}
