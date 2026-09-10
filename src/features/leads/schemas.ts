import { z } from "zod";
import { locales } from "@/i18n/locales";

export const serviceOptions = [
  "automation",
  "consulting",
  "web_development",
  "other",
] as const;

export const timelineOptions = [
  "asap",
  "this_month",
  "exploring",
] as const;

export const leadSchema = z.object({
  locale: z.enum(locales),
  fullName: z.string().trim().min(2).max(80),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^[+0-9()\-\s]+$/),
  company: z.string().trim().max(120),
  service: z.enum(serviceOptions),
  timeline: z.enum(timelineOptions),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal(true),
});

export type LeadInput = z.infer<typeof leadSchema>;
