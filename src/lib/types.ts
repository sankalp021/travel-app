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
