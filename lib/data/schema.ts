import { z } from "zod";

const placeCategory = z.enum([
  "hotel",
  "hawker",
  "restaurant",
  "attraction",
  "view",
  "transit",
]);

const timeOfDay = z.enum([
  "morning",
  "midday",
  "afternoon",
  "evening",
  "night",
]);

const reservation = z.object({
  required: z.boolean(),
  deadline: z.string().optional(),
  bookingUrl: z.string().url().optional(),
  priceSGD: z.string().optional(),
  notes: z.string().optional(),
});

const place = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "ids must be lowercase-with-hyphens"),
  name: z.string().min(1),
  category: placeCategory,
  day: z.number().int().min(1).max(7),
  timeOfDay,
  lat: z.number().min(1.1).max(1.5),
  lng: z.number().min(103.5).max(104.1),
  description: z.string().min(1),
  pregnancyNotes: z.string().optional(),
  tips: z.array(z.string()).optional(),
  reservation: reservation.optional(),
});

const day = z.object({
  number: z.number().int().min(1).max(7),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  summary: z.string().min(1),
});

export const itinerarySchema = z.object({
  days: z.array(day).length(7),
  places: z.array(place).min(1),
});

export type ItinerarySchema = z.infer<typeof itinerarySchema>;
