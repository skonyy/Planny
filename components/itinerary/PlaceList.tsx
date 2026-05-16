"use client";

import { places, days } from "@/lib/data/itinerary";
import { markerStyle } from "@/lib/markers";
import { TIME_OF_DAY_ORDER } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceListProps {
  activeDay: number | null;
  onSelectPlace: (id: string) => void;
  selectedPlaceId: string | null;
}

export function PlaceList({
  activeDay,
  onSelectPlace,
  selectedPlaceId,
}: PlaceListProps) {
  const visible = (activeDay == null ? places : places.filter((p) => p.day === activeDay))
    .slice()
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return TIME_OF_DAY_ORDER[a.timeOfDay] - TIME_OF_DAY_ORDER[b.timeOfDay];
    });

  const activeDayMeta = activeDay != null ? days.find((d) => d.number === activeDay) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pb-2 pt-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {activeDayMeta
            ? formatDate(activeDayMeta.date)
            : "All week"}{" "}
          · {visible.length} {visible.length === 1 ? "place" : "places"}
        </div>
        {activeDayMeta && (
          <h2 className="mt-0.5 text-base font-semibold text-foreground">
            {activeDayMeta.title}
          </h2>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        <ul className="flex flex-col gap-1.5">
          {visible.map((place) => {
            const { icon: Icon, bgClass } = markerStyle(place.category);
            const selected = place.id === selectedPlaceId;
            return (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onSelectPlace(place.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border border-transparent p-2 text-left transition-colors hover:bg-muted/60",
                    selected && "border-border bg-muted/80"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white",
                      bgClass
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {place.name}
                      </span>
                      {place.reservation?.required && (
                        <Ticket
                          className="h-3.5 w-3.5 shrink-0 text-foreground/60"
                          aria-label="Reservation"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-normal capitalize">
                        {place.timeOfDay}
                      </Badge>
                      <span className="capitalize">{place.category}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default PlaceList;
