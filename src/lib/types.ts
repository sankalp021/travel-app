export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Stay {
  id: string;
  name: string;
  description: string;
  price: string;
  amenities: string[];
}

export interface Transport {
  id: string;
  type: string;
  description: string;
  cost: string;
}

export interface SocialSpot {
  id: string;
  name: string;
  description: string;
  type: string; // e.g., "bar", "hostel event", "meetup"
}

export interface DestinationData {
  activities: Activity[];
  stays: Stay[];
  transport: Transport[];
  socialSpots: SocialSpot[];
}

// New interfaces for itinerary generation

export interface TripPreferences {
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  budgetLevel: 'budget' | 'moderate' | 'luxury';
  travelStyle: 'relaxed' | 'balanced' | 'packed';
  interests: string[]; // e.g. ["culture", "food", "nightlife"]
  dietaryRestrictions?: string[];
  additionalNotes?: string;
}

export interface ItineraryDay {
  date: string;           // e.g. "Day 1 - Monday, June 10"
  activities: {
    time: string;         // e.g. "09:00 AM"
    activity: string;     // e.g. "Visit Grand Palace"
    location?: string;    // e.g. "Na Phra Lan Road"
    notes?: string;       // Additional details
    cost?: string;        // Estimated cost
  }[];
}

export interface BudgetBreakdown {
  accommodation: {
    totalCost: string;   // e.g. "$120"
    perNight: string;    // e.g. "$40"
    details: string;     // Any budget notes
  };
  food: {
    totalCost: string;   // e.g. "$90" 
    perDay: string;      // e.g. "$30"
    details: string;     // Budget notes or recommendations
  };
  activities: {
    totalCost: string;   // e.g. "$75"
    details: string[];   // List of activity costs
  };
  transportation: {
    totalCost: string;   // e.g. "$45"
    details: string[];   // Breakdown of transport costs
  };
  miscellaneous: {
    totalCost: string;   // e.g. "$30"
    details: string[];   // Other expenses
  };
  totalBudget: string;   // e.g. "$360"
}

export interface PackingItem {
  category: string;      // e.g. "Clothing", "Electronics"
  items: string[];       // e.g. ["Lightweight t-shirts (3-4)", "Power adapter"]
}

export interface LocalTip {
  title: string;         // e.g. "Hidden Beach Spot"
  description: string;   // Details about the tip
  category: string;      // e.g. "Local Secret", "Cultural Tip", "Safety"
}

export interface ItineraryResult {
  destination: string;
  summary: string;       // Brief overview of the itinerary
  schedule: ItineraryDay[];
  budget: BudgetBreakdown;
  packingList: PackingItem[];
  localTips: LocalTip[];
  transportRecommendations: string[];
}

export interface UserSelections {
  destination: string;
  selectedActivities: Activity[];
  selectedStay?: Stay;
  selectedTransport: Transport[];
  selectedSocialSpots: SocialSpot[];
  preferences: TripPreferences;
}
