import type { PostgrestError } from "@supabase/supabase-js";
import { ApiError } from "@/features/leads/leadsApi";
import { supabase } from "@/lib/supabase";
import type { FollowUpTask } from "@/types";

function toApiError(error: PostgrestError, fallback: string): ApiError {
  if (import.meta.env.DEV) console.error("[followUpsApi]", error);

  if (error.code === "42501")
    return new ApiError("You don't have permission to do that.");
  if (error.code === "23503")
    return new ApiError("That lead no longer exists.");
  if (error.code === "PGRST116")
    return new ApiError("That follow-up no longer exists.");
  if (/fetch|network/i.test(error.message)) {
    return new ApiError(
      "Network problem. Check your connection and try again.",
    );
  }
  return new ApiError(fallback);
}

interface FollowUpRow {
  id: string;
  lead_id: string;
  title: string;
  due_date: string;
  completed_at: string | null;
}

function rowToFollowUp(row: FollowUpRow): FollowUpTask {
  return {
    id: row.id,
    leadId: row.lead_id,
    title: row.title,
    dueDate: row.due_date,
    completedAt: row.completed_at,
  };
}

export async function listFollowUps(): Promise<FollowUpTask[]> {
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*")
    .order("due_date", { ascending: true })
    .limit(1000);

  if (error) throw toApiError(error, "Could not load your follow-ups.");
  return (data as FollowUpRow[]).map(rowToFollowUp);
}

export interface NewFollowUp {
  leadId: string;
  title: string;
  dueDate: string;
}

export async function insertFollowUp(
  input: NewFollowUp,
): Promise<FollowUpTask> {
  const { data, error } = await supabase
    .from("follow_ups")
    .insert({
      lead_id: input.leadId,
      title: input.title,
      due_date: input.dueDate,
    })
    .select()
    .single();

  if (error) throw toApiError(error, "Could not add the follow-up.");
  return rowToFollowUp(data as FollowUpRow);
}

export async function patchFollowUpCompleted(
  id: string,
  completed: boolean,
): Promise<FollowUpTask> {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();

  if (error) throw toApiError(error, "Could not update the follow-up.");
  return rowToFollowUp(data as FollowUpRow);
}

export async function removeFollowUp(id: string): Promise<void> {
  const { error } = await supabase.from("follow_ups").delete().eq("id", id);
  if (error) throw toApiError(error, "Could not delete the follow-up.");
}
