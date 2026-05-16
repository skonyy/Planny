"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { Ticket, LocateFixed, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { parseUrlState, serializeUrlState, type UrlState } from "@/lib/url-state";
import { days } from "@/lib/data/itinerary";

const DESKTOP_LEFT_PAD = 400 + 16;

export function MapApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Start with null state (matches SSR), then sync the URL before first paint.
  // useLayoutEffect fires synchronously after hydration commit but before the
  // browser paints, so the user never sees the "All" pill selected on a day URL.
  const [urlState, setUrlState] = useState<UrlState>({ day: null, placeId: null });
  useLayoutEffect(() => {
    setUrlState(parseUrlState(new URLSearchParams(window.location.search)));
  }, [searchParams]);
  const { day: activeDay, placeId: selectedPlaceId } = urlState;

  const [snap, setSnap] = useState<SheetSnap | null>(() =>
    selectedPlaceId ? SHEET_SNAP_POINTS[2] : SHEET_SNAP_POINTS[1]
  );
  const [reservationsOpen, setReservationsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showRoute, setShowRoute] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  const handleGeolocate = useCallback(() => {
    if (isTracking) {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
      setUserLocation(null);
      return;
    }
    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        setIsTracking(false);
        if (err.code === 1 /* PERMISSION_DENIED */) {
          toast.error("Location access denied", {
            description: "Go to Settings → Safari → Location and allow access for this site.",
          });
        } else {
          toast.error("Could not get your location", {
            description: "Make sure Location Services are on and try again.",
          });
        }
      },
      { enableHighAccuracy: true }
    );
  }, [isTracking]);

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
      setSnap(SHEET_SNAP_POINTS[1]);
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

  const handleSwipeLeft = useCallback(() => {
    if (activeDay === null) {
      const first = days[0];
      if (first) handleDayChange(first.number);
    } else {
      const idx = days.findIndex((d) => d.number === activeDay);
      const next = days[idx + 1];
      if (next) handleDayChange(next.number);
    }
  }, [activeDay, handleDayChange]);

  const handleSwipeRight = useCallback(() => {
    if (activeDay === null) return;
    const idx = days.findIndex((d) => d.number === activeDay);
    if (idx <= 0) handleDayChange(null);
    else handleDayChange(days[idx - 1].number);
  }, [activeDay, handleDayChange]);

  const lastDay = days[days.length - 1];
  const canSwipeLeft = !(activeDay !== null && activeDay === lastDay?.number);
  const canSwipeRight = activeDay !== null;

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
          showNavigation={isDesktop}
          userLocation={userLocation}
          showRoute={showRoute}
        />
      </div>

      {isDesktop ? (
        <DesktopPanel>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h1 className="text-base font-semibold">Singapore Week</h1>
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
            className="pointer-events-none fixed inset-x-0 top-0 z-40"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="pointer-events-auto mx-auto mt-2 w-[calc(100%-1rem)] max-w-xl rounded-full border bg-background/95 shadow-md backdrop-blur supports-backdrop-filter:bg-background/80">
              <DayPills activeDay={activeDay} onChange={handleDayChange} />
            </div>
          </div>
          <FabReservations onClick={() => setReservationsOpen(true)} />
          <button
            type="button"
            onClick={handleGeolocate}
            className={cn(
              "fixed left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-lg transition-colors",
              isTracking && "border-blue-500 bg-blue-500 text-white"
            )}
            style={{ bottom: "calc(var(--sheet-peek) + env(safe-area-inset-bottom) + 0.75rem)" }}
            aria-label="My location"
          >
            <LocateFixed className="h-5 w-5" />
          </button>
          {activeDay != null && (
            <button
              type="button"
              onClick={() => setShowRoute((v) => !v)}
              className={cn(
                "fixed left-20 z-40 flex h-12 w-12 items-center justify-center rounded-full border bg-background shadow-lg transition-colors",
                showRoute && "border-foreground bg-foreground text-background"
              )}
              style={{ bottom: "calc(var(--sheet-peek) + env(safe-area-inset-bottom) + 0.75rem)" }}
              aria-label={showRoute ? "Hide route" : "Show route"}
              aria-pressed={showRoute}
            >
              <Route className="h-5 w-5" />
            </button>
          )}
          <BottomSheet snap={snap} onSnapChange={setSnap} onSwipeLeft={canSwipeLeft ? handleSwipeLeft : undefined} onSwipeRight={canSwipeRight ? handleSwipeRight : undefined}>
            {selectedPlaceId ? (
              <PlaceDetail
                placeId={selectedPlaceId}
                onBack={handleBack}
                lockScroll={snap !== SHEET_SNAP_POINTS[2]}
              />
            ) : (
              <PlaceList
                activeDay={activeDay}
                onSelectPlace={handleSelectPlace}
                selectedPlaceId={selectedPlaceId}
                lockScroll={snap !== SHEET_SNAP_POINTS[2]}
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
