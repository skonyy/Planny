"use client";

import * as React from "react";
import { Drawer as Vaul } from "vaul";
import { cn } from "@/lib/utils";

export const SHEET_SNAP_POINTS = [0.15, 0.5, 0.92] as const;
export type SheetSnap = (typeof SHEET_SNAP_POINTS)[number];

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_RATIO = 1.5;
const DIRECTION_LOCK_PX = 6; // pixels of movement before locking to horizontal or vertical

interface BottomSheetProps {
  snap: SheetSnap | null;
  onSnapChange: (snap: SheetSnap | null) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  snap,
  onSnapChange,
  onSwipeLeft,
  onSwipeRight,
  children,
  className,
}: BottomSheetProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const animating = React.useRef(false);
  // Keep latest callbacks in refs so the effect closure never goes stale
  const onSwipeLeftRef = React.useRef(onSwipeLeft);
  const onSwipeRightRef = React.useRef(onSwipeRight);
  React.useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
  });

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let direction: "horizontal" | "vertical" | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (animating.current) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      direction = null;
      el.style.transition = "none";
    };

    const onTouchMove = (e: TouchEvent) => {
      if (animating.current) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // Determine direction once movement crosses the lock threshold
      if (direction === null && (Math.abs(dx) > DIRECTION_LOCK_PX || Math.abs(dy) > DIRECTION_LOCK_PX)) {
        direction = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      }

      if (direction === "horizontal") {
        // Prevent default cancels browser scroll AND vaul's pointer events (browser spec)
        e.preventDefault();
        el.style.transform = `translateX(${dx * 0.7}px)`;
      }
      // vertical: do nothing — vaul handles snap-point dragging normally
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (animating.current || direction !== "horizontal") {
        direction = null;
        return;
      }
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      direction = null;

      const isSwipe =
        Math.abs(dx) > SWIPE_THRESHOLD_PX &&
        Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO;
      const handler = dx < 0 ? onSwipeLeftRef.current : onSwipeRightRef.current;

      if (isSwipe && handler) {
        animating.current = true;
        const goLeft = dx < 0;

        el.style.transition = "transform 180ms ease-in";
        el.style.transform = `translateX(${goLeft ? "-100%" : "100%"})`;

        setTimeout(() => {
          handler();
          el.style.transition = "none";
          el.style.transform = `translateX(${goLeft ? "100%" : "-100%"})`;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.transition = "transform 220ms ease-out";
              el.style.transform = "translateX(0)";
              setTimeout(() => {
                animating.current = false;
              }, 220);
            });
          });
        }, 180);
      } else {
        el.style.transition = "transform 280ms cubic-bezier(0.25, 1, 0.5, 1)";
        el.style.transform = "translateX(0)";
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []); // stable: callbacks read from refs, el from ref

  return (
    <Vaul.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={[...SHEET_SNAP_POINTS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={(s) => onSnapChange(s as SheetSnap | null)}
    >
      <Vaul.Portal>
        <Vaul.Content
          data-slot="bottom-sheet"
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 flex h-full max-h-[100dvh] flex-col overflow-x-hidden rounded-t-xl border-t bg-background text-foreground shadow-2xl outline-none",
            className
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-describedby={undefined}
        >
          <Vaul.Title className="sr-only">Trip itinerary</Vaul.Title>
          <Vaul.Description className="sr-only">
            Singapore week — places by day with reservations and tips.
          </Vaul.Description>
          <div className="mx-auto my-2 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
          <div ref={contentRef} className="flex min-h-0 flex-1 flex-col">
            {children}
          </div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}

export default BottomSheet;
