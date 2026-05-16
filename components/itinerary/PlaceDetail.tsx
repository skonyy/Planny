"use client";

import { getPlace, getDay, places } from "@/lib/data/itinerary";
import { markerStyle } from "@/lib/markers";
import { useCurrentTime } from "@/lib/hooks/use-current-time";
import {
  formatDuration,
  formatTimeRange,
  parseHHmm,
  placeDateTime,
  sortPlacesByTime,
} from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ExternalLink,
  CalendarClock,
  Baby,
  Lightbulb,
  Clock,
  Footprints,
  TrainFront,
  Star,
  MapPin,
} from "lucide-react";
import type { Place, Day } from "@/lib/types";

interface PlaceDetailProps {
  placeId: string;
  onBack: () => void;
}

export function PlaceDetail({ placeId, onBack }: PlaceDetailProps) {
  const place = getPlace(placeId);
  const now = useCurrentTime();

  if (!place) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <p className="text-sm text-muted-foreground">Place not found.</p>
        <Button variant="outline" size="sm" className="mt-3 self-start" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  const { icon: Icon, bgClass, label } = markerStyle(place.category);
  const day = getDay(place.day);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=&center=${place.lat},${place.lng}`;
  const walkUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=walking`;
  const transitUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=transit`;

  const hasSchedule = !!(place.startTime && place.endTime && day);
  const nextPlace = hasSchedule ? findNextPlace(place) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pb-1 pt-1">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex items-start gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${bgClass}`}>
            <Icon className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="text-lg font-semibold leading-tight text-foreground">
              {place.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary" className="capitalize">{label}</Badge>
              <Badge variant="outline" className="font-normal capitalize">{place.timeOfDay}</Badge>
              {place.googleRating != null && (
                <span className="flex items-center gap-0.5 font-medium text-foreground/80">
                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                  {place.googleRating.toFixed(1)}
                </span>
              )}
              {day && (
                <span>
                  Day {day.number} · {formatDate(day.date)}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/90">
          {place.description}
        </p>

        {hasSchedule && day && (
          <Schedule place={place} day={day} now={now} nextPlace={nextPlace} />
        )}

        {place.pregnancyNotes && (
          <Section icon={Baby} title="Pregnancy note">
            {place.pregnancyNotes}
          </Section>
        )}

        {place.tips && place.tips.length > 0 && (
          <Section icon={Lightbulb} title="Tips">
            <ul className="ml-1 list-disc space-y-1 pl-4">
              {place.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </Section>
        )}

        {place.reservation?.required && (
          <div className="mt-5 rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarClock className="h-4 w-4" />
              Reservation needed
            </div>
            <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
              {place.reservation.deadline && (
                <Row label="Book by">{formatDate(place.reservation.deadline)}</Row>
              )}
              {place.reservation.priceSGD && (
                <Row label="Price">SGD {place.reservation.priceSGD}</Row>
              )}
              {place.reservation.notes && (
                <Row label="Notes">{place.reservation.notes}</Row>
              )}
            </dl>
            {place.reservation.bookingUrl && (
              <Button asChild size="sm" className="mt-3 w-full">
                <a
                  href={place.reservation.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book now
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        )}

        <Separator className="my-5" />

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="h-3.5 w-3.5" />
              Open in Maps
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <a href={walkUrl} target="_blank" rel="noopener noreferrer">
              <Footprints className="h-3.5 w-3.5" />
              Walk
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <a href={transitUrl} target="_blank" rel="noopener noreferrer">
              <TrainFront className="h-3.5 w-3.5" />
              Metro
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function findNextPlace(current: Place): Place | null {
  const sameDay = sortPlacesByTime(
    places.filter((p) => p.day === current.day && p.startTime)
  );
  const idx = sameDay.findIndex((p) => p.id === current.id);
  if (idx === -1 || idx === sameDay.length - 1) return null;
  return sameDay[idx + 1];
}

function Schedule({
  place,
  day,
  now,
  nextPlace,
}: {
  place: Place;
  day: Day;
  now: Date;
  nextPlace: Place | null;
}) {
  const start = place.startTime!;
  const end = place.endTime!;
  const duration = formatDuration(parseHHmm(end) - parseHHmm(start));

  const startAt = placeDateTime(day, start);
  const endAt = placeDateTime(day, end);
  const status = computeStatus(now, startAt, endAt);

  return (
    <div className="mt-5 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Clock className="h-4 w-4" />
        Planned {formatTimeRange(start, end)} · {duration}
      </div>
      {status && (
        <div
          className={
            status.kind === "ended"
              ? "mt-1 text-sm text-muted-foreground"
              : "mt-1 text-sm font-medium text-foreground"
          }
        >
          {status.text}
        </div>
      )}
      {nextPlace?.startTime && (
        <div className="mt-1 text-xs text-muted-foreground">
          Next: {nextPlace.name} at {nextPlace.startTime}
        </div>
      )}
    </div>
  );
}

type Status =
  | { kind: "before"; text: string }
  | { kind: "during"; text: string }
  | { kind: "ended"; text: string };

function computeStatus(now: Date, startAt: Date, endAt: Date): Status | null {
  const nowMs = now.getTime();
  // Only show live status on the place's own calendar day
  const sameDay =
    now.getFullYear() === startAt.getFullYear() &&
    now.getMonth() === startAt.getMonth() &&
    now.getDate() === startAt.getDate();
  if (!sameDay) return null;

  if (nowMs < startAt.getTime()) {
    const mins = Math.round((startAt.getTime() - nowMs) / 60_000);
    return { kind: "before", text: `Starts in ${formatDuration(mins)}` };
  }
  if (nowMs <= endAt.getTime()) {
    const mins = Math.round((endAt.getTime() - nowMs) / 60_000);
    const endHHmm = `${String(endAt.getHours()).padStart(2, "0")}:${String(endAt.getMinutes()).padStart(2, "0")}`;
    return {
      kind: "during",
      text: `Leave by ${endHHmm} · ${formatDuration(mins)} left`,
    };
  }
  const mins = Math.round((nowMs - endAt.getTime()) / 60_000);
  return { kind: "ended", text: `Ended ${formatDuration(mins)} ago` };
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="mt-1 text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 text-foreground/70">{label}</dt>
      <dd className="flex-1">{children}</dd>
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

export default PlaceDetail;
