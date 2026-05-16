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
        "flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-background text-white shadow-md transition-transform duration-200",
        bgClass,
        selected && "scale-125 ring-4 ring-foreground/30"
      )}
      aria-label={place.name}
    >
      <Icon className="h-4 w-4" strokeWidth={2.4} />
    </div>
  );
}

export default PlaceMarker;
