"use client";

import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { placesWithReservation } from "@/lib/data/itinerary";
import { cn } from "@/lib/utils";

interface FabReservationsProps {
  onClick: () => void;
  className?: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FabReservations({ onClick, className }: FabReservationsProps) {
  const today = todayIso();
  const total = placesWithReservation().length;
  const pending = placesWithReservation().filter(
    (p) => p.reservation?.deadline && p.reservation.deadline >= today
  ).length;
  const overdue = total - pending;

  return (
    <Button
      type="button"
      variant="coral"
      onClick={onClick}
      className={cn(
        "fixed right-4 z-40 h-12 gap-2 px-5 shadow-[0_6px_20px_-6px_rgba(217,84,38,0.5)]",
        className
      )}
      style={{ bottom: "calc(var(--sheet-peek) + env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <Ticket className="h-4 w-4" />
      <span className="text-sm font-semibold">Bookings</span>
      <Badge
        variant={overdue > 0 ? "destructive" : "secondary"}
        className="ml-0.5 h-5 px-1.5 text-[10px]"
      >
        {total}
      </Badge>
    </Button>
  );
}

export default FabReservations;
