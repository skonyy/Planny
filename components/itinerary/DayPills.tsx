"use client";

import { forwardRef, useEffect, useRef } from "react";
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = activeRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const elRect = el.getBoundingClientRect();
    const scRect = scroller.getBoundingClientRect();
    if (elRect.left < scRect.left || elRect.right > scRect.right) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeDay]);

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "flex w-full snap-x snap-mandatory gap-2 overflow-x-auto px-2 py-2 scroll-px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      <Pill
        active={activeDay === null}
        onClick={() => onChange(null)}
        ref={activeDay === null ? activeRef : undefined}
      >
        All
      </Pill>
      {days.map((d) => (
        <Pill
          key={d.number}
          active={activeDay === d.number}
          today={d.date === today}
          past={d.date < today}
          onClick={() => onChange(d.number)}
          ref={activeDay === d.number ? activeRef : undefined}
        >
          <span className="font-semibold">{shortLabel(d.date)}</span>
          <span className="text-xs opacity-70"> · {d.number}</span>
        </Pill>
      ))}
    </div>
  );
}

const Pill = forwardRef<
  HTMLButtonElement,
  {
    active: boolean;
    today?: boolean;
    past?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }
>(function Pill({ active, today, past, onClick, children }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 snap-start rounded-full px-4 py-2 text-sm transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-card text-muted-foreground hover:text-foreground",
        past && !active && "opacity-55",
      )}
    >
      {children}
      {today && !active && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-coral"
        />
      )}
    </button>
  );
});

export default DayPills;
