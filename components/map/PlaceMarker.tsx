"use client";

import { markerStyle } from "@/lib/markers";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/types";

interface PlaceMarkerProps {
  place: Place;
  selected: boolean;
}

export function PlaceMarker({ place, selected }: PlaceMarkerProps) {
  const { icon: Icon, bgClass } = markerStyle(place.category);
  return (
    <div
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-[3px] border-background text-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform duration-200",
        bgClass,
        selected && "scale-115 ring-2 ring-accent-coral ring-offset-2 ring-offset-background",
      )}
      aria-label={place.name}
    >
      <Icon className="h-4 w-4" strokeWidth={2.6} />
    </div>
  );
}

export default PlaceMarker;
