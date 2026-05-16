"use client";

import * as React from "react";
import { Drawer as Vaul } from "vaul";
import { cn } from "@/lib/utils";

export const SHEET_SNAP_POINTS = [0.15, 0.5, 0.92] as const;
export type SheetSnap = (typeof SHEET_SNAP_POINTS)[number];

const SWIPE_THRESHOLD_PX = 50;
const SWIPE_RATIO = 1.5;
const DIRECTION_LOCK_PX = 6;

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
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const gestureDir = React.useRef<"horizontal" | "vertical" | null>(null);

  // Keep callbacks in refs so handlers never go stale
  const onSwipeLeftRef = React.useRef(onSwipeLeft);
  const onSwipeRightRef = React.useRef(onSwipeRight);
  React.useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
  });

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (animating.current || e.pointerType === "mouse") return;
      dragStart.current = { x: e.clientX, y: e.clientY };
      gestureDir.current = null;
      // No setPointerCapture — letting the browser keep natural event routing so
      // the inner scroll container handles vertical scroll natively, and vaul can
      // detect "this touch is on a scrollable element" before deciding to drag the sheet.
      const el = contentRef.current;
      if (el) el.style.transition = "none";
    },
    []
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = contentRef.current;
      if (!dragStart.current || !el || animating.current) return;

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      if (
        gestureDir.current === null &&
        (Math.abs(dx) > DIRECTION_LOCK_PX || Math.abs(dy) > DIRECTION_LOCK_PX)
      ) {
        gestureDir.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";

        if (gestureDir.current === "vertical") {
          // Vertical — bail out entirely, let vaul and the browser handle it
          dragStart.current = null;
          return;
        }
      }

      if (gestureDir.current === "horizontal") {
        // Stop propagation so vaul's onPointerMove doesn't fire → sheet stays put
        e.stopPropagation();
        el.style.transform = `translateX(${dx * 0.7}px)`;
      }
    },
    []
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = contentRef.current;
      if (!dragStart.current || !el || gestureDir.current !== "horizontal") {
        dragStart.current = null;
        gestureDir.current = null;
        return;
      }

      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = null;
      gestureDir.current = null;

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
    },
    []
  );

  const handlePointerCancel = React.useCallback(() => {
    dragStart.current = null;
    gestureDir.current = null;
    const el = contentRef.current;
    if (el) {
      el.style.transition = "transform 280ms cubic-bezier(0.25, 1, 0.5, 1)";
      el.style.transform = "translateX(0)";
    }
  }, []);

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
            "fixed inset-x-0 bottom-0 z-30 flex h-full max-h-[100dvh] flex-col rounded-t-xl border-t bg-background text-foreground shadow-2xl outline-none",
            className
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-describedby={undefined}
        >
          <Vaul.Title className="sr-only">Trip itinerary</Vaul.Title>
          <Vaul.Description className="sr-only">
            Singapore week — places by day with reservations and tips.
          </Vaul.Description>
          {/* Handle sits outside the animated area so it never moves during swipes */}
          <div className="mx-auto my-2 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
          {/*
            overflow:clip clips translated content without creating a scroll
            container (unlike overflow:hidden which sets implicit overflow-y:auto
            and causes a double-scroll bug).
          */}
          <div className="flex min-h-0 flex-1 flex-col [overflow:clip]">
            <div
              ref={contentRef}
              className="flex min-h-0 flex-1 flex-col"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              {children}
            </div>
          </div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}

export default BottomSheet;
