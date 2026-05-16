# Design tokens

Tailwind v4. Tokens live in `app/globals.css` under `:root` (CSS variables) and `@theme inline` (Tailwind's color/font/radius mapping). **Never** introduce raw hex / px in component files.

## Base palette

shadcn `neutral` `radix-nova`. The following vars (from `:root`) are already wired into Tailwind utilities via `@theme inline`:

`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`.

Reach for these instead of raw colors. E.g. `bg-muted text-muted-foreground` for a quiet block.

## App-specific tokens (additions)

Add these to `:root` in `app/globals.css`. They are read directly from JS in `lib/markers.ts` for marker styling.

```css
:root {
  /* Sheet snap points (also referenced from BottomSheet.tsx via getComputedStyle) */
  --sheet-peek: 15dvh;
  --sheet-half: 50dvh;
  --sheet-full: 92dvh;

  /* Marker colors per category. Light, saturated enough to read on the map. */
  --marker-hotel: oklch(0.55 0.03 250);       /* slate */
  --marker-hawker: oklch(0.72 0.16 75);       /* amber */
  --marker-restaurant: oklch(0.65 0.18 15);   /* rose */
  --marker-attraction: oklch(0.68 0.14 160);  /* emerald */
  --marker-view: oklch(0.72 0.12 230);        /* sky */
  --marker-transit: oklch(0.55 0.02 270);     /* zinc */
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
}
```

This lets you write `bg-marker-hawker` in JSX.

## Radius

Use shadcn's scale: `rounded-sm/md/lg/xl/2xl/3xl/4xl`. `--radius` is the base, others scale from it.

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
