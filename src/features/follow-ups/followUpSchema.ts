import { z } from "zod";

export const followUpFormSchema = z.object({
  leadId: z.string().min(1, "Choose a lead"),
  title: z
    .string()
    .trim()
    .min(1, "Describe the follow-up")
    .max(200, "Keep it under 200 characters"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a due date"),
});

export type FollowUpFormValues = z.infer<typeof followUpFormSchema>;
