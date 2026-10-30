import { z } from "zod";
import { ACTIVITY_TYPES } from "@/lib/constants";

export const activityFormSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  summary: z
    .string()
    .trim()
    .min(1, "Write a short summary")
    .max(1000, "Keep it under 1000 characters"),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
