"use client";

import { getPlace, getDay } from "@/lib/data/itinerary";
import { markerStyle } from "@/lib/markers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ExternalLink,
  CalendarClock,
  Baby,
  Lightbulb,
} from "lucide-react";

interface PlaceDetailProps {
  placeId: string;
  onBack: () => void;
}

export function PlaceDetail({ placeId, onBack }: PlaceDetailProps) {
  const place = getPlace(placeId);

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

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=walking`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 pb-1 pt-1">
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

        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            Directions
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
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
