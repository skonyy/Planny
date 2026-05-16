import type { Day, Place } from "@/lib/types";
import { TIME_OF_DAY_ORDER } from "@/lib/types";

const TIME_OF_DAY_MINUTES: Record<string, number> = {
  morning: 9 * 60,
  midday: 12 * 60,
  afternoon: 14 * 60,
  evening: 18 * 60,
  night: 21 * 60,
};

export function parseHHmm(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function placeDateTime(day: Day, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day.date + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d;
}

export function sortPlacesByTime(places: Place[]): Place[] {
  return places.slice().sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    const aMin = a.startTime ? parseHHmm(a.startTime) : TIME_OF_DAY_MINUTES[a.timeOfDay];
    const bMin = b.startTime ? parseHHmm(b.startTime) : TIME_OF_DAY_MINUTES[b.timeOfDay];
    if (aMin !== bMin) return aMin - bMin;
    return TIME_OF_DAY_ORDER[a.timeOfDay] - TIME_OF_DAY_ORDER[b.timeOfDay];
  });
}
