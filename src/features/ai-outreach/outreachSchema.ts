import { z } from "zod";
import { isValidWebsite } from "@/lib/url";

export const OUTREACH_CHANNELS = ["whatsapp", "email"] as const;
export const OUTREACH_TONES = [
  "professional",
  "friendly",
  "persuasive",
] as const;

export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];
export type OutreachTone = (typeof OUTREACH_TONES)[number];

export const OUTREACH_CHANNEL_LABELS: Record<OutreachChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
};

export const OUTREACH_TONE_LABELS: Record<OutreachTone, string> = {
  professional: "Professional",
  friendly: "Friendly",
  persuasive: "Persuasive",
};

export const outreachFormSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name is required")
    .max(120, "Keep it under 120 characters"),
  website: z
    .string()
    .trim()
    .max(200, "Keep it under 200 characters")
    .refine(isValidWebsite, "Enter a valid website, like example.com"),
  service: z
    .string()
    .trim()
    .min(1, "Describe the service you offer")
    .max(120, "Keep it under 120 characters"),
  channel: z.enum(OUTREACH_CHANNELS),
  tone: z.enum(OUTREACH_TONES),
  context: z.string().trim().max(1000, "Keep it under 1000 characters"),
});

export type OutreachFormValues = z.infer<typeof outreachFormSchema>;

export const defaultOutreachValues: OutreachFormValues = {
  businessName: "",
  website: "",
  service: "Website redesign",
  channel: "whatsapp",
  tone: "professional",
  context: "I want to offer a modern, mobile-friendly website.",
};
