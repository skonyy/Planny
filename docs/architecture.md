# Architecture

One static page at `/` with client islands for map + sheet. All state lives in the URL.

## Layers

```
data/itinerary.json          ← source of truth (places, days)
  ↓ (Zod parse at module load)
lib/data/itinerary.ts        ← exports validated `days`, `places`
  ↓
components/layout/MapApp.tsx ← reads URL, wires map ↔ sheet
  ├── components/map/MapView.tsx        (MapLibre + Protomaps)
  ├── components/itinerary/DayPills.tsx (Tabs)
  ├── components/layout/BottomSheet.tsx (vaul) → PlaceList / PlaceDetail
  ├── components/layout/DesktopPanel.tsx (md+ replaces BottomSheet)
  └── components/layout/FabReservations.tsx → ReservationsDialog
```

## URL state

Single source of truth for "what's selected":

| Param     | Type       | Meaning                                                         |
| --------- | ---------- | --------------------------------------------------------------- |
| `day`     | `1`–`7`    | Filter to one day. Absent = "All".                              |
| `placeId` | slug       | Selected place. Sheet opens to `full` and map flies to the pin. |

Read with `useSearchParams()`. Write with `router.replace()` (shallow, no scroll). The component owning state is `MapApp.tsx`. It must be inside `<Suspense>` per Next 16 prerendering rules — `app/page.tsx` wraps it.

## Mobile sheet snap points

Defined as CSS vars in `app/globals.css`:

- `--sheet-peek: 15dvh` — handle + "N places · Day X"
- `--sheet-half: 50dvh` — scrollable place list
- `--sheet-full: 92dvh` — single-place detail

vaul handles drag friction. Safe-area inset is applied to the bottom padding of the sheet content.

## Responsive switch

Single breakpoint: `md` (768px).

- Below `md`: `<BottomSheet>` renders, `<DesktopPanel>` returns `null`.
- At `md+`: vice versa. Map fills the area to the right of the panel.

`MapApp` chooses with a `useMediaQuery('(min-width: 768px)')` hook (custom, in `lib/hooks/use-media-query.ts`).

## Map

- `MapLibre` instance, single GeoJSON source built from `places`.
- Cluster: `cluster: true`, `clusterMaxZoom: 13`, `clusterRadius: 50`.
- Day filter applied via `setFilter` on the unclustered-point layer (`['==', ['get', 'day'], dayNum]`).
- Markers are styled with a circle layer + symbol layer (Lucide icon glyph via PNG sprite? — simpler: HTML markers via `<Marker>` from `react-map-gl/maplibre`, styled with Tailwind).
- Click on cluster → `flyTo` to cluster center, zoom in.
- Click on unclustered point → write `placeId` to URL.

Basemap: Protomaps demo tiles for now (`https://api.protomaps.com/tiles/v3.pmtiles` — public demo). For prod we can swap to a self-hosted PMTiles file under `/public/tiles/sg.pmtiles`. See `docs/components.md` Map section for details.

## Rendering

`app/page.tsx`:

```tsx
export const dynamic = 'force-static'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MapApp />
    </Suspense>
  )
}
```

All map/sheet code is client-side (`'use client'`).
