import { FunctionsHttpError } from "@supabase/supabase-js";
import type { OutreachFormValues } from "@/features/ai-outreach/outreachSchema";
import { ApiError } from "@/features/leads/leadsApi";
import { supabase } from "@/lib/supabase";

function readField(value: unknown, field: "message" | "error"): string | null {
  if (typeof value !== "object" || value === null || !(field in value))
    return null;
  const entry: unknown = (value as Record<string, unknown>)[field];
  return typeof entry === "string" ? entry : null;
}

export async function generateOutreach(
  input: OutreachFormValues,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-outreach", {
    body: {
      businessName: input.businessName,
      website: input.website,
      service: input.service,
      channel: input.channel,
      tone: input.tone,
      context: input.context,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body: unknown = await error.context.json().catch(() => null);
      throw new ApiError(
        readField(body, "error") ??
          "Could not generate a message. Please try again.",
      );
    }
    throw new ApiError("Network problem. Check your connection and try again.");
  }

  const payload: unknown = data;
  const message = readField(payload, "message");

  if (message === null || message.trim() === "") {
    throw new ApiError("The AI returned an empty message. Please try again.");
  }
  return message;
}
