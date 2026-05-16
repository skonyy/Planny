# Design tokens

Tailwind v4. Tokens live in `app/globals.css` under `:root` (CSS variables) and `@theme inline` (Tailwind's color/font/radius mapping). **Never** introduce raw hex / px in component files.

## Base palette

shadcn `neutral` `radix-nova`. The following vars (from `:root`) are already wired into Tailwind utilities via `@theme inline`:

`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`.

Reach for these instead of raw colors. E.g. `bg-muted text-muted-foreground` for a quiet block.

## App-specific tokens (additions)

Add these to `:root` in `app/globals.css`. Marker colors are also read from JS in `lib/markers.ts`.

```css
:root {
  /* Sheet snap points (also referenced from BottomSheet.tsx via getComputedStyle) */
  --sheet-peek: 15dvh;
  --sheet-half: 50dvh;
  --sheet-full: 92dvh;

  /* Singapore-coral accent — used sparingly: FAB, selected marker ring, today dot. */
  --accent-coral: oklch(0.68 0.18 28);
  --accent-coral-foreground: oklch(0.985 0 0);

  /* Status: confirmed/booked items. */
  --status-confirmed: oklch(0.72 0.18 145);
  --status-confirmed-foreground: oklch(0.985 0 0);

  /* Map route line color (no raw hex in MapView.tsx). */
  --map-route-line: oklch(0.45 0 0);

  /* Marker colors per category. Uniform L/C, varying hue. */
  --marker-hotel:      oklch(0.62 0.13 250);  /* blue */
  --marker-hawker:     oklch(0.78 0.17 75);   /* amber */
  --marker-restaurant: oklch(0.62 0.18 25);   /* rose */
  --marker-attraction: oklch(0.68 0.14 160);  /* emerald */
  --marker-view:       oklch(0.70 0.13 220);  /* sky */
  --marker-transit:    oklch(0.55 0.02 270);  /* zinc */
}
```

Surface them as Tailwind utilities via `@theme inline`:

```css
@theme inline {
  --color-marker-hotel: var(--marker-hotel);
  --color-marker-hawker: var(--marker-hawker);
  --color-marker-restaurant: var(--marker-restaurant);
  --color-marker-attraction: var(--marker-attraction);
  --color-marker-view: var(--marker-view);
  --color-marker-transit: var(--marker-transit);
  --color-accent-coral: var(--accent-coral);
  --color-accent-coral-foreground: var(--accent-coral-foreground);
  --color-status-confirmed: var(--status-confirmed);
  --color-status-confirmed-foreground: var(--status-confirmed-foreground);
  --color-map-route-line: var(--map-route-line);
}
```

This lets you write `bg-marker-hawker`, `bg-accent-coral text-accent-coral-foreground`, `bg-status-confirmed`, etc.

### Accent usage rules

**`accent-coral` is the single warm accent.** Reserve it for:

- The reservations FAB (`FabReservations`)
- The selected map marker's ring
- The "today" dot indicator on `DayPills`
- One-off coral badges where they meaningfully signal "now" or "active"

Do **not** use coral for body text, large surfaces, generic buttons, hover states, or category coloring (use marker tokens for those).

## Radius

`--radius: 1rem` is the base. Scale: `rounded-sm` (0.6×) → `rounded-md` (0.8×) → `rounded-lg` (1×) → `rounded-xl` (1.4×) → `rounded-2xl` (1.8×) → `rounded-3xl` (2.2×) → `rounded-4xl` (2.6×). Cards default to `rounded-2xl`; buttons default to `rounded-full` (pill).

## Surfaces

- **Page background** = `--background` (pure white).
- **Cards** = `--card` (`oklch(0.97 0 0)` — slightly off-white). This is the key visual lift: cards sit visibly inset on the page without needing borders or shadows.
- **Sheets / popovers** = `--popover` (pure white) — they're already lifted by elevation.

## Spacing

Default Tailwind v4 scale. Prefer the named scale over arbitrary `[14px]` values.

## Fonts

`--font-sans` is the Geist sans (declared in `app/layout.tsx`). Body inherits via the `@layer base { html { @apply font-sans } }` rule.

## Light mode only (v1)

The shadcn init wrote `.dark` overrides in `globals.css`. We do **not** apply `dark` to `<html>` — see `app/layout.tsx`. If you want to add dark mode later, you also need a toggle UI; for now leave the `.dark` block in place (it does no harm).

## Map style

The Protomaps basemap is configured for a light, minimal aesthetic. The style URL / style spec lives in `components/map/MapView.tsx`. If you ever theme the map, the source of truth for the colors used there is **still** this file — declare a new var and reference it from the map config.

## Adding a token

1. Add to `:root` in `app/globals.css`.
2. If it should be a Tailwind utility, also add to `@theme inline`.
3. Document it in this file (a single row in a table — short).
4. Same commit.
