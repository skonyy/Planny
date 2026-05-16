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

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  day: number;
  timeOfDay: TimeOfDay;
  lat: number;
  lng: number;
  description: string;
  pregnancyNotes?: string;
  tips?: string[];
  reservation?: Reservation;
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
