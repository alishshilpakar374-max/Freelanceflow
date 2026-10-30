import type { PostgrestError } from "@supabase/supabase-js";
import { isLeadPriority, isLeadSource, isLeadStatus } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { Lead, LeadInput, LeadStatus } from "@/types";

// Only errors of this class are safe to show to users. Anything else gets a generic message.
export class ApiError extends Error {}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return error instanceof ApiError ? error.message : fallback;
}

function toApiError(error: PostgrestError, fallback: string): ApiError {
  if (import.meta.env.DEV) console.error("[leadsApi]", error);

  if (error.code === "23503") {
    return new ApiError(
      "This lead is still linked to a project. Remove the project first.",
    );
  }
  if (error.code === "42501") {
    return new ApiError("You don't have permission to do that.");
  }
  if (error.code === "PGRST116") {
    return new ApiError("That lead no longer exists.");
  }
  if (/fetch|network/i.test(error.message)) {
    return new ApiError(
      "Network problem. Check your connection and try again.",
    );
  }
  return new ApiError(fallback);
}

// ---- Row type: exactly what the `leads` table returns (snake_case) ----------

interface LeadRow {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  priority: string;
  status: string;
  deal_value: number | string;
  notes: string;
  next_follow_up: string | null;
  created_at: string;
}

// The database CHECK constraints guarantee valid values, but TypeScript can't know that,
// so we narrow with type guards (and fall back safely instead of using `as`).
function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    businessName: row.business_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    website: row.website,
    source: isLeadSource(row.source) ? row.source : "other",
    priority: isLeadPriority(row.priority) ? row.priority : "medium",
    status: isLeadStatus(row.status) ? row.status : "new",
    dealValue: Number(row.deal_value),
    notes: row.notes,
    nextFollowUp: row.next_follow_up,
    createdAt: row.created_at,
  };
}

// Note what's missing: user_id. The database fills it in with auth.uid().
function inputToRow(input: LeadInput) {
  return {
    business_name: input.businessName,
    contact_name: input.contactName,
    email: input.email,
    phone: input.phone,
    website: input.website,
    source: input.source,
    priority: input.priority,
    status: input.status,
    deal_value: input.dealValue,
    notes: input.notes,
    next_follow_up: input.nextFollowUp,
  };
}

// ---- Operations ---------------------------------------------------------------

export async function listLeads(): Promise<Lead[]> {
  // RLS already limits this to YOUR rows. (PostgREST returns at most 1000 rows by default,
  // which is plenty for now. We'd add pagination if you ever outgrow it.)
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw toApiError(error, "Could not load your leads.");
  return (data as LeadRow[]).map(rowToLead);
}

export async function insertLead(input: LeadInput): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .insert(inputToRow(input))
    .select()
    .single();

  if (error) throw toApiError(error, "Could not add the lead.");
  return rowToLead(data as LeadRow);
}

export async function patchLead(id: string, input: LeadInput): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .update(inputToRow(input))
    .eq("id", id)
    .select()
    .single();

  if (error) throw toApiError(error, "Could not save your changes.");
  return rowToLead(data as LeadRow);
}

export async function removeLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw toApiError(error, "Could not delete the lead.");
}

// ---- Pipeline move (with the dev-only failure switch from Phase 4B) ---------------

const SIMULATE_FAILURE_KEY = "freelanceflow-simulate-failure";

function shouldSimulateFailure(): boolean {
  if (!import.meta.env.DEV) return false;

  try {
    return localStorage.getItem(SIMULATE_FAILURE_KEY) === "true";
  } catch {
    return false;
  }
}

export async function persistLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<void> {
  if (shouldSimulateFailure()) {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 400));
    throw new ApiError("Simulated network failure");
  }

  // .select('id') lets us detect "0 rows updated". RLS and deleted rows fail SILENTLY otherwise.
  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) throw toApiError(error, "Could not move the lead.");
  if (!data || data.length === 0)
    throw new ApiError("That lead no longer exists.");
}
