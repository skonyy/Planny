"use client";

import * as React from "react";
import { Drawer as Vaul } from "vaul";
import { cn } from "@/lib/utils";

export const SHEET_SNAP_POINTS = [0.15, 0.5, 0.92] as const;
export type SheetSnap = (typeof SHEET_SNAP_POINTS)[number];

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_RATIO = 1.5;

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
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const animating = React.useRef(false);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (animating.current) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const el = contentRef.current;
    if (el) el.style.transition = "none";
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    const el = contentRef.current;
    if (!touchStart.current || !el || animating.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      el.style.transform = `translateX(${dx * 0.7}px)`;
    }
  }, []);

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      const el = contentRef.current;
      if (!touchStart.current || !el) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;

      const isHorizontal =
        Math.abs(dx) > SWIPE_THRESHOLD_PX &&
        Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO;
      const handler = dx < 0 ? onSwipeLeft : onSwipeRight;

      if (isHorizontal && handler) {
        animating.current = true;
        const goLeft = dx < 0;

        // Slide current content out
        el.style.transition = "transform 180ms ease-in";
        el.style.transform = `translateX(${goLeft ? "-100%" : "100%"})`;

        setTimeout(() => {
          // Change the day — React re-renders children
          handler();

          // Position new content off-screen on the opposite side (invisible while off-screen)
          el.style.transition = "none";
          el.style.transform = `translateX(${goLeft ? "100%" : "-100%"})`;

          // Two rAFs ensure the browser has painted before we start the enter animation
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
        // Not far enough — spring back
        el.style.transition = "transform 280ms cubic-bezier(0.25, 1, 0.5, 1)";
        el.style.transform = "translateX(0)";
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

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
          <div
            ref={contentRef}
            className="flex min-h-0 flex-1 flex-col"
            style={{ touchAction: "pan-y" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {children}
          </div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}

export default BottomSheet;
