# Singapore Week

A map-first, mobile-first itinerary app for a 7-day Singapore trip (16–22 May 2026). Built with Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, MapLibre GL, and Zod.

The whole trip lives in `data/itinerary.json`. Open `/` and you see Singapore with every place pinned. Filter by day, tap a marker for details, hit the Bookings FAB for the pre-trip checklist.

## Dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```

No env vars needed — the map basemap is the free OpenFreeMap "Positron" style.

## Editing the trip

Edit `data/itinerary.json`. The build re-validates the file with Zod; a typo fails the build with a readable error and the previous deploy stays live.

You can edit it from your phone via GitHub's mobile web (tap the file → pencil → commit) and Vercel auto-deploys in ~30 seconds. See [`docs/content-guide.md`](docs/content-guide.md) for the full flow.

## Project rules

Before changing code, skim:

- **[`CLAUDE.md`](CLAUDE.md)** — top-level rules + stack overview.
- **[`docs/architecture.md`](docs/architecture.md)** — how the pieces fit together.
- **[`docs/components.md`](docs/components.md)** — shadcn-first rule + component inventory.
- **[`docs/design-tokens.md`](docs/design-tokens.md)** — Tailwind theme + CSS vars.
- **[`docs/data-model.md`](docs/data-model.md)** — types ↔ schema ↔ JSON.
- **[`docs/content-guide.md`](docs/content-guide.md)** — tone, pregnancy notes, geocoding.

## Deploy

Push the repo to GitHub, import on Vercel — that's it. No configuration required.
