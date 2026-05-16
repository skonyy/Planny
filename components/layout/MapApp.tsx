"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapView } from "@/components/map/MapView";
import { DayPills } from "@/components/itinerary/DayPills";
import { PlaceList } from "@/components/itinerary/PlaceList";
import { PlaceDetail } from "@/components/itinerary/PlaceDetail";
import { ReservationsDialog } from "@/components/itinerary/ReservationsDialog";
import {
  BottomSheet,
  SHEET_SNAP_POINTS,
  type SheetSnap,
} from "@/components/layout/BottomSheet";
import { DesktopPanel } from "@/components/layout/DesktopPanel";
import { FabReservations } from "@/components/layout/FabReservations";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { parseUrlState, serializeUrlState } from "@/lib/url-state";
import { days } from "@/lib/data/itinerary";

const DESKTOP_LEFT_PAD = 400 + 16;

export function MapApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const urlState = useMemo(
    () => parseUrlState(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const { day: activeDay, placeId: selectedPlaceId } = urlState;

  const [snap, setSnap] = useState<SheetSnap | null>(() =>
    selectedPlaceId ? SHEET_SNAP_POINTS[2] : SHEET_SNAP_POINTS[1]
  );
  const [reservationsOpen, setReservationsOpen] = useState(false);

  const updateUrl = useCallback(
    (updates: { day?: number | null; placeId?: string | null }) => {
      const next = serializeUrlState({
        day: "day" in updates ? updates.day ?? null : activeDay,
        placeId:
          "placeId" in updates ? updates.placeId ?? null : selectedPlaceId,
      });
      router.replace(`/${next}`, { scroll: false });
    },
    [router, activeDay, selectedPlaceId]
  );

  const handleSelectPlace = useCallback(
    (id: string) => {
      setSnap(SHEET_SNAP_POINTS[2]);
      updateUrl({ placeId: id });
    },
    [updateUrl]
  );

  const handleBack = useCallback(() => {
    setSnap(SHEET_SNAP_POINTS[1]);
    updateUrl({ placeId: null });
  }, [updateUrl]);

  const handleDayChange = useCallback(
    (day: number | null) => updateUrl({ day, placeId: null }),
    [updateUrl]
  );

  const maxDay = days[days.length - 1]?.number ?? 7;

  const handleSwipeLeft = useCallback(() => {
    if (activeDay === null) handleDayChange(1);
    else if (activeDay < maxDay) handleDayChange(activeDay + 1);
  }, [activeDay, maxDay, handleDayChange]);

  const handleSwipeRight = useCallback(() => {
    if (activeDay === null) return;
    handleDayChange(activeDay === 1 ? null : activeDay - 1);
  }, [activeDay, handleDayChange]);

  const [viewportH, setViewportH] = useState(0);
  useEffect(() => {
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sheetBottomPadding = useMemo(() => {
    if (isDesktop) return 60;
    if (viewportH === 0) return 200;
    if (snap === 0.92) return Math.round(viewportH * 0.92);
    if (snap === 0.5) return Math.round(viewportH * 0.5);
    return Math.round(viewportH * 0.15);
  }, [snap, isDesktop, viewportH]);

  return (
    <div className="fixed inset-0">
      <div
        className="absolute inset-0"
        style={isDesktop ? { left: DESKTOP_LEFT_PAD } : undefined}
      >
        <MapView
          activeDay={activeDay}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={handleSelectPlace}
          bottomPadding={sheetBottomPadding}
        />
      </div>

      {isDesktop ? (
        <DesktopPanel>
          <div className="flex items-center justify-between border-b px-3 py-3">
            <h1 className="px-1 text-base font-semibold">Singapore Week</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReservationsOpen(true)}
            >
              <Ticket className="h-4 w-4" />
              Bookings
            </Button>
          </div>
          <DayPills activeDay={activeDay} onChange={handleDayChange} className="border-b" />
          {selectedPlaceId ? (
            <PlaceDetail placeId={selectedPlaceId} onBack={handleBack} />
          ) : (
            <PlaceList
              activeDay={activeDay}
              onSelectPlace={handleSelectPlace}
              selectedPlaceId={selectedPlaceId}
            />
          )}
        </DesktopPanel>
      ) : (
        <>
          <div
            className="pointer-events-none fixed inset-x-0 top-0 z-20"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="pointer-events-auto mx-auto mt-2 w-[calc(100%-1rem)] max-w-xl rounded-full border bg-background/95 shadow-md backdrop-blur supports-backdrop-filter:bg-background/80">
              <DayPills activeDay={activeDay} onChange={handleDayChange} />
            </div>
          </div>
          <FabReservations onClick={() => setReservationsOpen(true)} />
          <BottomSheet snap={snap} onSnapChange={setSnap} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight}>
            {selectedPlaceId ? (
              <PlaceDetail placeId={selectedPlaceId} onBack={handleBack} />
            ) : (
              <PlaceList
                activeDay={activeDay}
                onSelectPlace={handleSelectPlace}
                selectedPlaceId={selectedPlaceId}
              />
            )}
          </BottomSheet>
        </>
      )}

      <ReservationsDialog
        open={reservationsOpen}
        onOpenChange={setReservationsOpen}
      />
    </div>
  );
}

export default MapApp;
