# Components

## Hard rule: shadcn first

Before creating a new file under `components/`, ask:

1. Does a shadcn primitive in `components/ui/` already do this? Use it.
2. Is there a composed shadcn pattern in the [shadcn docs](https://ui.shadcn.com/docs/components) that fits? Compose primitives.
3. Only if neither — create a custom component, and **add it to the inventory below**.

Use `cn()` from `@/lib/utils` to merge classes. Never duplicate Tailwind logic between branches; merge via `cn`.

## Installed shadcn primitives

(Run `npx shadcn@latest add <name>` to install more. They land in `components/ui/`.)

| Component     | Use for                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| `Button`      | Any interactive action. **Pill by default** (`rounded-full` for all sizes). Variants: `default` (black), `outline` (white pill, 1px border), `ghost`, `secondary`, `coral` (accent FAB). Size `lg` ≈ 48px tall. |
| `Card`        | Place list rows, reservation rows. `rounded-2xl` with `bg-card` (off-white). No border, no shadow — visible only by surface contrast against the white page. |
| `Badge`       | Time-of-day pill, category pill, "Reservation needed" indicator. Variants: `default`, `secondary`, `outline`, `destructive`, **`coral`** (accent), **`confirmed`** (booked / green). |
| `Tabs`        | Day pills (re-styled as horizontal scrollable pills).                       |
| `ScrollArea`  | Place list inside the sheet; reservations accordion if long.                |
| `Drawer`      | Mobile bottom sheet (built on `vaul`).                                      |
| `Sheet`       | Desktop side panel (not used on mobile — `Drawer` is preferred there).      |
| `Dialog`      | Reservations modal (desktop overlay; on mobile we may switch to `Drawer`).  |
| `Separator`   | Visual divider inside Card / sheet content.                                 |
| `Accordion`   | Reservations checklist.                                                     |
| `Sonner`      | Toasts (e.g. "Booking link copied").                                        |

## Custom components inventory

Live under `components/{map,itinerary,layout}/`. They **compose** primitives — they are not new primitives.

| File                                              | Purpose                                               |
| ------------------------------------------------- | ----------------------------------------------------- |
| `components/map/MapView.tsx`                      | MapLibre instance + clustered markers + fly-to API.   |
| `components/map/PlaceMarker.tsx`                  | HTML marker: colored dot + Lucide icon per category. White 3px ring + shadow for lift; selected = scale-up + 2px coral ring. |
| `components/itinerary/DayPills.tsx`               | Horizontal scrollable day filter. Pill states: inactive = `bg-card`; active = `bg-foreground text-background`; today (when inactive) = small coral dot indicator (top-right). |
| `components/itinerary/PlaceList.tsx`              | List of `Card`s for the active day's places.          |
| `components/itinerary/PlaceDetail.tsx`            | Full place view: description, tips, pregnancy, link.  |
| `components/itinerary/ReservationsDialog.tsx`     | Dialog wrapping an `Accordion` checklist.             |
| `components/itinerary/ReservationItem.tsx`        | One row in the accordion.                             |
| `components/layout/MapApp.tsx`                    | Owns URL state; wires map ↔ sheet ↔ dialog.           |
| `components/layout/BottomSheet.tsx`               | `vaul` wrapper with 3 snap points. Top radius `rounded-t-[1.5rem]`; subtle grabber (`h-1 w-10 bg-foreground/15`). |
| `components/layout/DesktopPanel.tsx`              | Left-side panel for `md+`.                            |
| `components/layout/FabReservations.tsx`           | Floating action button → opens reservations dialog. **Coral** (`variant="coral"`) — the one place the accent is used on a CTA. |

## Decision tree for "do I need a custom component?"

- It's a re-usable UI shape with no domain knowledge → **shadcn primitive**.
- It's domain UI (a place row, a day pill, the reservations panel) → custom under `components/{map,itinerary,layout}/`.
- It's a one-off composition used in exactly one place → inline JSX in the parent; don't make a file.

## Naming

- Files: `PascalCase.tsx` (matches shadcn convention in `components/ui/`).
- Props: prefer a single `props: Props` typed object over inline destructuring in the signature when there are 4+ props. Otherwise destructure.
- Always export the component as the default and also as a named export (so it's tree-shake friendly and grepable).

## Anti-patterns

- Hand-rolling a button shape with `<div onClick>`. Use `<Button>`.
- Re-implementing a sheet/drawer animation. Use `Drawer`.
- Copy-pasting Tailwind class blobs between two components. Lift into a shared component or a `cn()`-aware utility.
- Importing from `@/components/ui/*` and then mutating the file to "tweak" the primitive. Instead, wrap it with composition or new variants via `cva`.

## Icons

`lucide-react`. Use the same icon for a given concept everywhere:

| Concept       | Icon         |
| ------------- | ------------ |
| Hotel         | `BedDouble`  |
| Hawker        | `Soup`       |
| Restaurant    | `Utensils`   |
| Attraction    | `Landmark`   |
| View          | `Eye`        |
| Transit       | `Plane`      |
| Reservation   | `Ticket`     |
| Deadline      | `CalendarClock` |
| External link | `ExternalLink` |
