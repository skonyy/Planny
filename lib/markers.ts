import {
  BedDouble,
  Soup,
  Utensils,
  Landmark,
  Eye,
  Plane,
  type LucideIcon,
} from "lucide-react";
import type { PlaceCategory } from "@/lib/types";

export interface MarkerStyle {
  icon: LucideIcon;
  colorVar: string;
  bgClass: string;
  label: string;
}

export const MARKER_STYLE: Record<PlaceCategory, MarkerStyle> = {
  hotel: {
    icon: BedDouble,
    colorVar: "var(--marker-hotel)",
    bgClass: "bg-marker-hotel",
    label: "Hotel",
  },
  hawker: {
    icon: Soup,
    colorVar: "var(--marker-hawker)",
    bgClass: "bg-marker-hawker",
    label: "Hawker",
  },
  restaurant: {
    icon: Utensils,
    colorVar: "var(--marker-restaurant)",
    bgClass: "bg-marker-restaurant",
    label: "Restaurant",
  },
  attraction: {
    icon: Landmark,
    colorVar: "var(--marker-attraction)",
    bgClass: "bg-marker-attraction",
    label: "Attraction",
  },
  view: {
    icon: Eye,
    colorVar: "var(--marker-view)",
    bgClass: "bg-marker-view",
    label: "View",
  },
  transit: {
    icon: Plane,
    colorVar: "var(--marker-transit)",
    bgClass: "bg-marker-transit",
    label: "Transit",
  },
};

export function markerStyle(category: PlaceCategory): MarkerStyle {
  return MARKER_STYLE[category];
}
