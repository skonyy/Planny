export type PlaceCategory =
  | "hotel"
  | "hawker"
  | "restaurant"
  | "attraction"
  | "view"
  | "transit";

export type TimeOfDay =
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "night";

export interface Reservation {
  required: boolean;
  deadline?: string;
  bookingUrl?: string;
  priceSGD?: string;
  notes?: string;
}

export interface PlaceTransit {
  mode: "walk" | "mrt" | "grab" | "bus";
  duration?: number;  // minutes
  line?: string;      // e.g. "DTL", "CCL", "EWL", "NEL", "NSL"
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  day: number;
  timeOfDay: TimeOfDay;
  startTime?: string;
  endTime?: string;
  lat: number;
  lng: number;
  description: string;
  pregnancyNotes?: string;
  tips?: string[];
  reservation?: Reservation;
  googleRating?: number;
  transit?: PlaceTransit;  // how to get here from the previous place on the same day
}

export interface Day {
  number: number;
  date: string;
  title: string;
  summary: string;
}

export interface Itinerary {
  days: Day[];
  places: Place[];
}

export const TIME_OF_DAY_ORDER: Record<TimeOfDay, number> = {
  morning: 0,
  midday: 1,
  afternoon: 2,
  evening: 3,
  night: 4,
};
