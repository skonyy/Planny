# CLAUDE.md — Singapore Week App

A map-first, mobile-first itinerary app for a 7-day Singapore trip (16–22 May 2026). Deployed on Vercel.

## Stack

- Next.js 16 (App Router) — **breaking changes vs. older Next; read `node_modules/next/dist/docs/` before touching APIs you're unsure of.**
- TypeScript strict
- Tailwind CSS v4 (`@import "tailwindcss"`; no `tailwind.config.js`)
- shadcn/ui — `radix-nova` style, `neutral` base, CSS variables
- `maplibre-gl` + `react-map-gl/maplibre` for the map (no API key — uses Protomaps tiles)
- `vaul` (via shadcn `Drawer`) for the mobile bottom sheet
- `zod` for runtime validation of `data/itinerary.json`
- `lucide-react` icons

## Rules (must read before editing)

1. **Read [docs/components.md](docs/components.md) before adding any UI primitive.** Always prefer shadcn primitives in `components/ui/`. Only add a custom component when shadcn truly lacks the primitive — and document it.
2. **Read [docs/design-tokens.md](docs/design-tokens.md) before adding any color, spacing, radius, or font value.** Never write raw hex / arbitrary px outside the token system. Marker colors live in CSS vars in `app/globals.css`.
3. **Read [docs/data-model.md](docs/data-model.md) before editing `lib/types.ts`, `lib/data/schema.ts`, or `data/itinerary.json`.** Types ↔ schema ↔ doc must change in the same commit.
4. **Read [docs/content-guide.md](docs/content-guide.md) before editing trip content.** Tone, pregnancy-note conventions, where to source coordinates.
5. **Read [docs/architecture.md](docs/architecture.md) for the system overview** — URL state shape, snap points, responsive breakpoints, file responsibilities.
6. **Mobile-first.** Default styles target the smallest viewport; desktop adds at `md:` and up. The bottom sheet is the primary UI on phone.
7. **No dark mode for v1.** CSS vars resolve to the light palette only. `<html className>` should not include `dark`.
8. **When you change a rule, update the doc that describes it in the same commit.** Documentation goes stale silently; treat it as code.

## Skills / plugins to use

- The user has installed shadcn-related skills and UI/UX skills via `/plugin`. When adding a component, prefer skill-guided generation over hand-rolling.
- For component lookups, prefer the shadcn MCP server (if registered) over guessing API shapes from memory.

## Common tasks

- **Add a place**: edit `data/itinerary.json`. Zod will fail the build if the shape is wrong. See [docs/content-guide.md](docs/content-guide.md).
- **Add a shadcn component**: `npx shadcn@latest add <name>` — they land in `components/ui/`.
- **Tweak design tokens**: `app/globals.css` `:root { … }`. Document the new var in [docs/design-tokens.md](docs/design-tokens.md).
- **Edit on the go**: see "Editing the itinerary after launch" in [docs/content-guide.md](docs/content-guide.md). GitHub mobile web → commit → Vercel auto-deploy.

## Don'ts

- No `tailwind.config.js` (we're on v4 — theme lives in CSS).
- No raw hex in components. Use a token.
- No new top-level `app/` routes; everything lives at `/`. State is in the URL via `?day=&placeId=`.
- No backend, no auth, no database. The trip is a week long.

@AGENTS.md
