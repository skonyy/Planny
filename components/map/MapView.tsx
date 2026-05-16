"use client";

import { useEffect, useMemo, useRef } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";
import { places } from "@/lib/data/itinerary";
import { PlaceMarker } from "./PlaceMarker";

const SINGAPORE_VIEW = {
  longitude: 103.8516,
  latitude: 1.3000,
  zoom: 11.4,
};

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

interface MapViewProps {
  activeDay: number | null;
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  bottomPadding?: number;
}

export function MapView({
  activeDay,
  selectedPlaceId,
  onSelectPlace,
  bottomPadding = 200,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  const visible = useMemo(
    () => (activeDay == null ? places : places.filter((p) => p.day === activeDay)),
    [activeDay]
  );

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
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: { top: 80, bottom: bottomPadding, left: 40, right: 40 },
        duration: 700,
        maxZoom: 15,
      }
    );
  }, [activeDay, selectedPlaceId, bottomPadding]);

  return (
    <Map
      ref={mapRef}
      initialViewState={SINGAPORE_VIEW}
      mapStyle={STYLE_URL}
      attributionControl={{ compact: true }}
      reuseMaps
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      {visible.map((place) => (
        <Marker
          key={place.id}
          longitude={place.lng}
          latitude={place.lat}
          anchor="bottom"
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
}

export default MapView;
