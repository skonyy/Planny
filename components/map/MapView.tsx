"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, forwardRef, useState, type Ref } from "react";
import Map, {
  Marker,
  NavigationControl,
  Source,
  Layer,
  type MapRef,
} from "react-map-gl/maplibre";
import { places } from "@/lib/data/itinerary";
import { sortPlacesByTime } from "@/lib/time";
import { PlaceMarker } from "./PlaceMarker";

function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

const SINGAPORE_VIEW = {
  longitude: 103.8516,
  latitude: 1.3000,
  zoom: 11.4,
};

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export interface MapViewHandle {
  fitBoundsToDay: (day: number, bottomPadding: number) => void;
}

interface MapViewProps {
  activeDay: number | null;
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  bottomPadding?: number;
  showNavigation?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  showRoute?: boolean;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView({
  activeDay,
  selectedPlaceId,
  onSelectPlace,
  bottomPadding = 200,
  showNavigation = true,
  userLocation,
  showRoute = true,
}: MapViewProps, ref: Ref<MapViewHandle>) {
  const mapRef = useRef<MapRef>(null);
  const hasFlownToUser = useRef(false);

  useImperativeHandle(ref, () => ({
    fitBoundsToDay: (day: number, padding: number) => {
      const map = mapRef.current;
      if (!map) return;
      const dayPlaces = places.filter((p) => p.day === day);
      if (dayPlaces.length === 0) return;
      const lngs = dayPlaces.map((p) => p.lng);
      const lats = dayPlaces.map((p) => p.lat);
      map.stop();
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: { top: 80, bottom: padding, left: 40, right: 40 }, duration: 700, maxZoom: 14 }
      );
    },
  }), []);
  const [routeLineColor, setRouteLineColor] = useState("#454545");
  useEffect(() => {
    setRouteLineColor(readToken("--map-route-line", "#454545"));
  }, []);

  const visible = useMemo(
    () => (activeDay == null ? places : places.filter((p) => p.day === activeDay)),
    [activeDay]
  );

  const routeGeoJSON = useMemo(() => {
    if (activeDay == null || !showRoute) return null;
    const ordered = sortPlacesByTime(visible);
    if (ordered.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: ordered.map((p) => [p.lng, p.lat]),
      },
    };
  }, [activeDay, showRoute, visible]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedPlaceId) {
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place) {
        map.flyTo({
          center: [place.lng, place.lat],
          zoom: 16,
          duration: 700,
          padding: { top: 40, bottom: bottomPadding, left: 40, right: 40 },
        });
        return;
      }
    }

    if (activeDay == null) {
      map.flyTo({
        center: [SINGAPORE_VIEW.longitude, SINGAPORE_VIEW.latitude],
        zoom: SINGAPORE_VIEW.zoom,
        duration: 700,
      });
      return;
    }

    const dayPlaces = places.filter((p) => p.day === activeDay);
    if (dayPlaces.length === 0) return;
    const lngs = dayPlaces.map((p) => p.lng);
    const lats = dayPlaces.map((p) => p.lat);
    map.stop();
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: { top: 80, bottom: bottomPadding, left: 40, right: 40 },
        duration: 700,
        maxZoom: 14,
      }
    );
  }, [activeDay, selectedPlaceId, bottomPadding]);

  // Fly to user location on first fix; reset when tracking stops
  useEffect(() => {
    if (!userLocation) {
      hasFlownToUser.current = false;
      return;
    }
    if (hasFlownToUser.current) return;
    const map = mapRef.current;
    if (!map) return;
    hasFlownToUser.current = true;
    map.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 16,
      duration: 700,
    });
  }, [userLocation]);

  return (
    <Map
      ref={mapRef}
      initialViewState={SINGAPORE_VIEW}
      mapStyle={STYLE_URL}
      attributionControl={{ compact: true }}
      reuseMaps
      style={{ width: "100%", height: "100%" }}
    >
      {showNavigation && <NavigationControl position="top-right" showCompass={false} />}

      {routeGeoJSON && (
        <Source id="day-route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="day-route-line"
            type="line"
            paint={{
              "line-color": routeLineColor,
              "line-width": 2.5,
              "line-opacity": 0.55,
              "line-dasharray": [2, 2],
            }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </Source>
      )}

      {userLocation && (
        <Marker
          longitude={userLocation.lng}
          latitude={userLocation.lat}
          anchor="center"
        >
          {/* Pulsing blue dot for user location */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-10 w-10 rounded-full bg-blue-500/20 animate-ping" />
            <div className="relative h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
          </div>
        </Marker>
      )}

      {visible.map((place) => (
        <Marker
          key={place.id}
          longitude={place.lng}
          latitude={place.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onSelectPlace(place.id);
          }}
        >
          <PlaceMarker place={place} selected={place.id === selectedPlaceId} />
        </Marker>
      ))}
    </Map>
  );
});

export default MapView;
