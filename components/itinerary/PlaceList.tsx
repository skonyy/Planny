"use client";

import { places, days } from "@/lib/data/itinerary";
import { markerStyle } from "@/lib/markers";
import { formatTimeRange, sortPlacesByTime } from "@/lib/time";
import type { Place, PlaceTransit } from "@/lib/types";
import { Star, Ticket, Footprints, TrainFront, Car, Bus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceListProps {
  activeDay: number | null;
  onSelectPlace: (id: string) => void;
  selectedPlaceId: string | null;
  lockScroll?: boolean;
}

export function PlaceList({
  activeDay,
  onSelectPlace,
  selectedPlaceId,
  lockScroll = false,
}: PlaceListProps) {
  const visible = sortPlacesByTime(
    activeDay == null ? places : places.filter((p) => p.day === activeDay)
  );

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
      <div className={cn("min-h-0 flex-1 px-4 pb-[20vh]", lockScroll ? "overflow-hidden" : "overflow-y-auto")}>
        <ul className="flex flex-col">
          {visible.map((place, idx) => {
            const { icon: Icon, bgClass } = markerStyle(place.category);
            const selected = place.id === selectedPlaceId;
            const next = visible[idx + 1];
            const showTransit = next?.day === place.day && next?.transit;
            return (
              <>
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
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium capitalize tabular-nums text-foreground/75">
                          {place.startTime && place.endTime
                            ? formatTimeRange(place.startTime, place.endTime)
                            : place.timeOfDay}
                        </span>
                        <span className="capitalize">{place.category}</span>
                        {place.googleRating != null && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                            {place.googleRating.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
                {showTransit && (
                  <TransitSeparator key={`transit-${place.id}`} transit={next.transit!} />
                )}
              </>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function transitLabel(transit: PlaceTransit): string {
  const mode =
    transit.mode === "mrt" ? (transit.line ?? "MRT") :
    transit.mode === "walk" ? "Walk" :
    transit.mode === "grab" ? "Grab" : "Bus";
  return transit.duration ? `${mode} · ${transit.duration} min` : mode;
}

function TransitSeparator({ transit }: { transit: PlaceTransit }) {
  const Icon =
    transit.mode === "walk" ? Footprints :
    transit.mode === "mrt" ? TrainFront :
    transit.mode === "bus" ? Bus : Car;

  return (
    <li aria-hidden className="pointer-events-none flex items-center gap-3 px-2 py-0">
      <div className="flex w-9 shrink-0 flex-col items-center">
        <div className="h-2.5 w-px bg-border/50" />
        <Icon className="h-3 w-3 text-muted-foreground/50" strokeWidth={2} />
        <div className="h-2.5 w-px bg-border/50" />
      </div>
      <span className="text-xs text-muted-foreground/60">{transitLabel(transit)}</span>
    </li>
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
