"use client";

import * as React from "react";
import { placesWithReservation, getDay } from "@/lib/data/itinerary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ReservationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReservationsDialog({
  open,
  onOpenChange,
}: ReservationsDialogProps) {
  const reservations = placesWithReservation();
  const today = todayIso();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b p-4 pb-3">
          <DialogTitle>Reservations to book</DialogTitle>
          <DialogDescription>
            Pre-trip bookings. Open the link, complete the booking, tick it off
            in your head. Today is{" "}
            {new Date().toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60dvh] overflow-y-auto p-2">
          <Accordion type="multiple" className="w-full">
            {reservations.map((place) => {
              const r = place.reservation!;
              const overdue = r.deadline != null && r.deadline < today;
              const day = getDay(place.day);
              return (
                <AccordionItem
                  key={place.id}
                  value={place.id}
                  className="px-2"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex flex-1 items-center justify-between gap-2 pr-2 text-left">
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {place.name}
                        </span>
                        {day && (
                          <span className="text-xs text-muted-foreground">
                            Day {day.number} · {day.title}
                          </span>
                        )}
                      </span>
                      {r.deadline && (
                        <Badge
                          variant={overdue ? "destructive" : "secondary"}
                          className="shrink-0"
                        >
                          {overdue ? "Overdue" : "By " + formatShort(r.deadline)}
                        </Badge>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 text-sm">
                    {r.priceSGD && (
                      <div className="text-muted-foreground">
                        Price: SGD {r.priceSGD}
                      </div>
                    )}
                    {r.notes && (
                      <div className="mt-1 text-foreground/80">{r.notes}</div>
                    )}
                    {r.bookingUrl && (
                      <Button asChild size="sm" className="mt-3 w-full">
                        <a
                          href={r.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open booking page
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default ReservationsDialog;
