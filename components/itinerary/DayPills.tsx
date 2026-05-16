"use client";

import { days } from "@/lib/data/itinerary";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shortLabel(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return WEEKDAY_SHORT[d.getDay()];
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DayPillsProps {
  activeDay: number | null;
  onChange: (day: number | null) => void;
  className?: string;
}

export function DayPills({ activeDay, onChange, className }: DayPillsProps) {
  const today = todayIso();
  return (
    <div
      className={cn(
        "flex w-full snap-x snap-mandatory gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      <Pill active={activeDay === null} onClick={() => onChange(null)}>
        All
      </Pill>
      {days.map((d) => (
        <Pill
          key={d.number}
          active={activeDay === d.number}
          past={d.date < today}
          onClick={() => onChange(d.number)}
        >
          <span className="font-semibold">{shortLabel(d.date)}</span>
          <span className="text-xs opacity-70"> · {d.number}</span>
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  past,
  onClick,
  children,
}: {
  active: boolean;
  past?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
        past && !active && "opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export default DayPills;
