# Data model

The source of truth is `data/itinerary.json`. It's loaded at module-evaluation time by `lib/data/itinerary.ts`, parsed by Zod (`lib/data/schema.ts`), and re-exported as typed `days` and `places`.

If Zod parse fails, the **build fails** with a readable error. This is intentional: a malformed edit on phone never reaches production.

## TypeScript shapes

Defined in `lib/types.ts`. Mirror in `lib/data/schema.ts` — keep both in sync.

```ts
export type PlaceCategory =
  | 'hotel'
  | 'hawker'
  | 'restaurant'
  | 'attraction'
  | 'view'
  | 'transit'

export type TimeOfDay =
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night'

export interface Reservation {
  required: boolean
  deadline?: string         // ISO date (YYYY-MM-DD)
  bookingUrl?: string
  priceSGD?: string         // free-form: "53", "80–100pp", "free"
  notes?: string
}

export interface PlaceTransit {
  mode: 'walk' | 'mrt' | 'grab' | 'bus'
  duration?: number         // minutes
  line?: string             // MRT line code: "DTL", "CCL", "EWL", "NEL", "NSL"
}

export interface Place {
  id: string                // slug, URL-safe. Used in ?placeId=
  name: string
  category: PlaceCategory
  day: number               // 1–7
  timeOfDay: TimeOfDay
  startTime?: string        // "HH:mm" 24h, e.g. "14:30"
  endTime?: string          // "HH:mm" 24h, must be after startTime
  lat: number               // decimal degrees
  lng: number               // decimal degrees
  description: string       // 1–3 sentences
  pregnancyNotes?: string   // optional safety / dietary note
  tips?: string[]           // bullet points
  reservation?: Reservation
  googleRating?: number     // 0.0–5.0, from Google Maps
  transit?: PlaceTransit    // how to get here from the previous place on the same day
}

export interface Day {
  number: number            // 1–7
  date: string              // ISO date
  title: string             // "Gardens by the Bay (the big one)"
  summary: string           // 1 sentence pitch for the day
}
```

## JSON shape

```jsonc
{
  "days": [
    {
      "number": 1,
      "date": "2026-05-16",
      "title": "Arrival — ease in near the hotel",
      "summary": "She's tired from the flight. Everything stays within 15 min walk."
    }
    // ...
  ],
  "places": [
    {
      "id": "albert-centre",
      "name": "Albert Centre Hawker",
      "category": "hawker",
      "day": 1,
      "timeOfDay": "evening",
      "startTime": "18:30",
      "endTime": "20:00",
      "lat": 1.3026,
      "lng": 103.8546,
      "description": "5-min walk from the hotel. First taste of hawker culture: bak kut teh, soon kueh, chwee kueh.",
      "pregnancyNotes": "Closed Thursdays. All recommended dishes are fully cooked.",
      "tips": ["Try bak kut teh at the back end."],
      "googleRating": 4.2
    }
    // ...
  ]
}
```

## IDs

`id` is a stable slug, used in URLs and as the React key. Conventions:

- lowercase
- words joined by `-`
- no diacritics
- prefer the short common name (`violet-oon` not `national-kitchen-by-violet-oon-at-national-gallery`)
- when you rename a place, **keep the old `id`** to avoid breaking shared URLs

## Coordinates

Decimal degrees, **4 decimal places minimum** (~11 m precision). Look up via Google Maps:

1. Search the place.
2. Right-click the pin → "What's here?"
3. Copy the `lat, lng` shown at the bottom.

Singapore bounds (sanity check): `lat 1.13–1.47`, `lng 103.6–104.1`.

## When you change the model

1. Update `lib/types.ts`.
2. Update `lib/data/schema.ts` Zod schemas to match.
3. Update this file's shapes section.
4. Run `npm run build` locally — if `data/itinerary.json` is now invalid, you'll see a clear Zod error pointing at the offending entry.
5. Fix the JSON or add a migration.

All in the same commit.
