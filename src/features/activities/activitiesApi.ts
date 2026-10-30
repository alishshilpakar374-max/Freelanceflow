import type { PostgrestError } from "@supabase/supabase-js";
import { ApiError } from "@/features/leads/leadsApi";
import { isActivityType } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { ActivityType, LeadActivity } from "@/types";

function toApiError(error: PostgrestError, fallback: string): ApiError {
  if (import.meta.env.DEV) console.error("[activitiesApi]", error);

  if (error.code === "42501")
    return new ApiError("You don't have permission to do that.");
  if (error.code === "23503")
    return new ApiError("That lead no longer exists.");
  if (/fetch|network/i.test(error.message)) {
    return new ApiError(
      "Network problem. Check your connection and try again.",
    );
  }
  return new ApiError(fallback);
}

interface ActivityRow {
  id: string;
  lead_id: string;
  type: string;
  summary: string;
  occurred_at: string;
}

function rowToActivity(row: ActivityRow): LeadActivity {
  return {
    id: row.id,
    leadId: row.lead_id,
    type: isActivityType(row.type) ? row.type : "note",
    summary: row.summary,
    occurredAt: row.occurred_at,
  };
}

export async function listActivities(): Promise<LeadActivity[]> {
  // Newest 500 is plenty for now. RLS limits this to your own rows.
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(500);

  if (error) throw toApiError(error, "Could not load your activity.");
  return (data as ActivityRow[]).map(rowToActivity);
}

export interface NewActivity {
  leadId: string;
  type: ActivityType;
  summary: string;
}

export async function insertActivity(
  input: NewActivity,
): Promise<LeadActivity> {
  // user_id is filled in by the database (default auth.uid()). occurred_at defaults to now().
  const { data, error } = await supabase
    .from("activities")
    .insert({ lead_id: input.leadId, type: input.type, summary: input.summary })
    .select()
    .single();

  if (error) throw toApiError(error, "Could not log the activity.");
  return rowToActivity(data as ActivityRow);
}

export async function removeActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw toApiError(error, "Could not delete the activity.");
}
