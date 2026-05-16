import raw from "@/data/itinerary.json";
import { itinerarySchema } from "./schema";
import type { Itinerary, Day, Place } from "@/lib/types";

const parsed = itinerarySchema.safeParse(raw);

if (!parsed.success) {
  console.error("Itinerary JSON failed validation:");
  console.error(parsed.error.format());
  throw new Error(
    "data/itinerary.json is invalid — fix the entries reported above."
  );
}

const itinerary: Itinerary = parsed.data;

export const days: Day[] = itinerary.days;
export const places: Place[] = itinerary.places;

export function getDay(num: number): Day | undefined {
  return days.find((d) => d.number === num);
}

export function getPlace(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}

export function placesForDay(num: number): Place[] {
  return places.filter((p) => p.day === num);
}

export function placesWithReservation(): Place[] {
  return places.filter((p) => p.reservation?.required);
}
