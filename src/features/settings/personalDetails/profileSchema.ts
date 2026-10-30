import { z } from "zod";
import { isValidWebsite } from "@/lib/url";

const PHONE_PATTERN = /^\+?[\d\s\-()]{6,20}$/;

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Your name is required")
    .max(120, "Keep it under 120 characters"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || PHONE_PATTERN.test(value),
      "Enter a valid mobile number",
    ),
  businessName: z.string().trim().max(120, "Keep it under 120 characters"),
  website: z
    .string()
    .trim()
    .max(200, "Keep it under 200 characters")
    .refine(isValidWebsite, "Enter a valid website, like example.com"),
  location: z.string().trim().max(120, "Keep it under 120 characters"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
