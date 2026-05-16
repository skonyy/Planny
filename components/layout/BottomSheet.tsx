"use client";

import * as React from "react";
import { Drawer as Vaul } from "vaul";
import { cn } from "@/lib/utils";

export const SHEET_SNAP_POINTS = [0.15, 0.5, 0.92] as const;
export type SheetSnap = (typeof SHEET_SNAP_POINTS)[number];

interface BottomSheetProps {
  snap: SheetSnap | null;
  onSnapChange: (snap: SheetSnap | null) => void;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  snap,
  onSnapChange,
  children,
  className,
}: BottomSheetProps) {
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
          <div className="mx-auto my-2 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}

export default BottomSheet;
