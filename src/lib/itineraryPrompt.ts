import { UserSelections, ItineraryResult } from "./types";

/**
 * Builds a structured prompt for the Gemini API based on user selections
 */
export function buildItineraryPrompt(selections: UserSelections): string {
  const { destination, selectedActivities, selectedStay, selectedTransport, selectedSocialSpots, preferences } = selections;
  
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
    activitiesByCategory[activity.category].push(`${activity.name}: ${activity.description}`);
  });
  
  // Format the prompt
  const prompt = `
You are a professional travel guide specializing in backpacker and budget-friendly travel planning. Create a detailed ${tripDuration}-day itinerary for ${destination} based on the following selected options and preferences.

TRIP DETAILS:
- Destination: ${destination}
- Date Range: ${preferences.startDate} to ${preferences.endDate} (${tripDuration} days)
- Budget Level: ${preferences.budgetLevel}
- Travel Style: ${preferences.travelStyle}
- Interests: ${preferences.interests.join(', ')}
${preferences.dietaryRestrictions ? `- Dietary Restrictions: ${preferences.dietaryRestrictions.join(', ')}` : ''}
${preferences.additionalNotes ? `- Additional Notes: ${preferences.additionalNotes}` : ''}

SELECTED ACCOMMODATION:
${selectedStay ? `- ${selectedStay.name}: ${selectedStay.description} (${selectedStay.price})` : '- No specific accommodation selected. Please recommend good backpacker options.'}

SELECTED TRANSPORTATION OPTIONS:
${selectedTransport.map(t => `- ${t.type}: ${t.description} (${t.cost})`).join('\n')}

SELECTED ACTIVITIES:
${Object.entries(activitiesByCategory).map(([category, activities]) => 
  `${category}:\n${activities.map(a => `- ${a}`).join('\n')}`
).join('\n\n')}

SELECTED SOCIAL SPOTS:
${selectedSocialSpots.map(spot => `- ${spot.name} (${spot.type}): ${spot.description}`).join('\n')}

Based on these selections, please create a comprehensive backpacker-friendly itinerary that includes:

1. DAILY SCHEDULE: Create a day-by-day plan with times, activities, locations, and estimated costs.
2. BUDGET BREAKDOWN: Provide a detailed budget for accommodation, food, activities, transportation, and miscellaneous expenses.
3. PACKING RECOMMENDATIONS: List essential items to bring for this trip.
4. LOCAL TIPS: Include hidden gems, cultural tips, and safety advice.
5. TRANSPORTATION PLAN: How to get around efficiently (including to/from activities).

Format the response as a structured JSON object matching this TypeScript interface:
\`\`\`typescript
interface ItineraryResult {
  destination: string;
  summary: string;
  schedule: Array<{
    date: string;
    activities: Array<{
      time: string;
      activity: string;
      location?: string;
      notes?: string;
      cost?: string;
    }>;
  }>;
  budget: {
    accommodation: {
      totalCost: string;
      perNight: string;
      details: string;
    };
    food: {
      totalCost: string;
      perDay: string;
      details: string;
    };
    activities: {
      totalCost: string;
      details: string[];
    };
    transportation: {
      totalCost: string;
      details: string[];
    };
    miscellaneous: {
      totalCost: string;
      details: string[];
    };
    totalBudget: string;
  };
  packingList: Array<{
    category: string;
    items: string[];
  }>;
  localTips: Array<{
    title: string;
    description: string;
    category: string;
  }>;
  transportRecommendations: string[];
}
\`\`\`

Return only the JSON object without any additional text.
`;

  return prompt;
}

/**
 * Parses and validates the Gemini API response
 */
export function parseItineraryResponse(text: string): ItineraryResult {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format: No JSON object found");
    }
    
    const jsonData = JSON.parse(jsonMatch[0]);
    
    // Validate the response has the expected structure
    if (!jsonData.destination || !jsonData.schedule || !jsonData.budget) {
      throw new Error("Invalid response structure: Missing required fields");
    }
    
    // Return the parsed data
    return jsonData as ItineraryResult;
  } catch (error) {
    console.error("Error parsing itinerary response:", error);
    throw new Error("Failed to parse the generated itinerary");
  }
}
