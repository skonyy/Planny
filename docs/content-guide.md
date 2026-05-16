# Content guide

How to add or edit places, days, and reservations in `data/itinerary.json`.

## Tone

- Second person, occasional. Mostly imperative: "Order the laksa with no cockles."
- Specific over generic: name the stall and the dish.
- Short. 1–3 sentences per place description.
- Practical: walking time, AC available, queue length, what to skip.

## Pregnancy notes

The user's wife is pregnant. **Always** flag any place where the obvious order has a risk. Conventions:

| Pattern                                                | Example                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| Skip a raw thing                                       | "Ask for laksa with **no cockles** — prawns and fishcake are fully cooked." |
| Cook level                                             | "Half-boiled eggs are off-limits — ask for **fully cooked / hard-boiled**." |
| Cap intake                                             | "Batang fish ≤1× this week (mercury)."                                      |
| All fine                                               | omit `pregnancyNotes` entirely.                                              |

Don't moralize. Don't over-explain. Just the rule + why if non-obvious.

## Reservations

A place needs `reservation` when **you have to act before arriving** to secure it. Otherwise omit.

```jsonc
{
  "reservation": {
    "required": true,
    "deadline": "2026-05-17",
    "bookingUrl": "https://www.gardensbythebay.com.sg/...",
    "priceSGD": "53",
    "notes": "Combo ticket: Flower Dome + Cloud Forest + Supertree Observatory."
  }
}
```

- `deadline` is "must-book-by" date. Pre-trip bookings → set to the day before they're needed.
- `priceSGD` is free-form: `"53"`, `"80–100pp"`, `"free"`, `"~10"`.
- `bookingUrl` should be the official site or Klook/Chope if that's where the actual booking happens.

## Categories — when to use which

| Category     | Use for                                                                |
| ------------ | ---------------------------------------------------------------------- |
| `hotel`      | Your accommodation only.                                               |
| `hawker`     | Hawker centres and food courts (Albert Centre, Maxwell, Lau Pa Sat).   |
| `restaurant` | Sit-down dining (Violet Oon, Jumbo, Zam Zam, kopitiams with tables).   |
| `attraction` | Museums, gardens, temples, neighbourhoods to walk through.             |
| `view`       | Lookout points, rooftop bars, light shows (Spectra, Garden Rhapsody).  |
| `transit`    | Airport, MRT stations explicitly listed in the plan (rare).            |

When a place is both — say, Jumbo Seafood next to the river view — pick the **primary intent**. Jumbo is restaurant.

## Time of day

| Value       | Rough hours |
| ----------- | ----------- |
| `morning`   | 7–11        |
| `midday`    | 11–14       |
| `afternoon` | 14–17       |
| `evening`   | 17–20       |
| `night`     | 20+         |

Pick one. Used for sort order within a day.

## Adding a new place — checklist

1. Pick an `id` (slug, see [data-model.md](data-model.md#ids)).
2. Look up coords on Google Maps (4+ decimal places).
3. Pick category + time of day.
4. Write a 1–3 sentence `description` (specific, what to order, how to get there).
5. Add `pregnancyNotes` if there's anything to flag.
6. Add `tips` if you'd lose them otherwise.
7. Add `reservation` only if a pre-trip action is required.
8. Commit `data/itinerary.json`.

## Editing the itinerary after launch — the low-friction flow

**Tier 1 — GitHub mobile (default):**

1. Open the repo on phone in GitHub mobile app or `github.com` in Safari.
2. Navigate to `data/itinerary.json` → tap the pencil icon.
3. Edit (add a place, fix a time, tweak a description).
4. Commit straight to `main` with a one-line message.
5. Vercel auto-deploys in ~30 seconds. Refresh the app.

If you mistype the JSON, Vercel's build will fail with a clear Zod error in the deploy log. The previous deploy stays live — production is not broken.

**Tier 1b — github.dev:** On desktop, press `.` while viewing the repo on github.com. Full VS Code in the browser, no clone. Edit, commit, same auto-deploy.

**Tier 2 — `?edit=1` in-app overlay (stretch, if implemented):**

- Visit `/?edit=1` to enable an "Edit" pencil on every place.
- Tweaks save to `localStorage`; the live app reflects them immediately on your device.
- A "Copy patched JSON" button in the FAB menu copies the full merged JSON to clipboard.
- Paste into `data/itinerary.json` via Tier 1 when you want the change to stick.

## Don'ts

- Don't write affiliate-style "this is amazing!" copy. Be plain.
- Don't add places you haven't actually researched location for.
- Don't move an existing place's `id`. It breaks shared URLs.
- Don't add new categories without updating `PlaceCategory` in `lib/types.ts`, the Zod schema, the marker color, the icon map, and this file.
