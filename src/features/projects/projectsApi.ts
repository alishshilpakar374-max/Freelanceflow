import type { PostgrestError } from "@supabase/supabase-js";
import { ApiError } from "@/features/leads/leadsApi";
import { isProjectStatus } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { Payment, PaymentInput, Project, ProjectInput } from "@/types";

function toApiError(error: PostgrestError, fallback: string): ApiError {
  if (import.meta.env.DEV) console.error("[projectsApi]", error);

  if (error.code === "42501")
    return new ApiError("You don't have permission to do that.");
  if (error.code === "23503")
    return new ApiError("That client or project no longer exists.");
  if (error.code === "23514")
    return new ApiError(
      "Some values are not allowed. Check the form and try again.",
    );
  if (error.code === "PGRST116")
    return new ApiError("That record no longer exists.");
  if (/fetch|network/i.test(error.message)) {
    return new ApiError(
      "Network problem. Check your connection and try again.",
    );
  }
  return new ApiError(fallback);
}

interface ProjectRow {
  id: string;
  lead_id: string;
  name: string;
  budget: number | string;
  start_date: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
}

interface PaymentRow {
  id: string;
  project_id: string;
  amount: number | string;
  paid_on: string;
  note: string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    leadId: row.lead_id,
    name: row.name,
    budget: Number(row.budget),
    startDate: row.start_date,
    deadline: row.deadline,
    status: isProjectStatus(row.status) ? row.status : "planning",
    createdAt: row.created_at,
  };
}

function rowToPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    projectId: row.project_id,
    amount: Number(row.amount),
    paidOn: row.paid_on,
    note: row.note,
  };
}

function projectInputToRow(input: ProjectInput) {
  return {
    lead_id: input.leadId,
    name: input.name,
    budget: input.budget,
    start_date: input.startDate,
    deadline: input.deadline,
    status: input.status,
  };
}

export interface ProjectsData {
  projects: Project[];
  payments: Payment[];
}

export async function listProjectsAndPayments(): Promise<ProjectsData> {
  const [projectsResult, paymentsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("*")
      .order("paid_on", { ascending: false })
      .limit(1000),
  ]);

  if (projectsResult.error)
    throw toApiError(projectsResult.error, "Could not load your projects.");
  if (paymentsResult.error)
    throw toApiError(paymentsResult.error, "Could not load your payments.");

  return {
    projects: (projectsResult.data as ProjectRow[]).map(rowToProject),
    payments: (paymentsResult.data as PaymentRow[]).map(rowToPayment),
  };
}

export async function insertProject(input: ProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert(projectInputToRow(input))
    .select()
    .single();

  if (error) throw toApiError(error, "Could not create the project.");
  return rowToProject(data as ProjectRow);
}

export async function patchProject(
  id: string,
  input: ProjectInput,
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update(projectInputToRow(input))
    .eq("id", id)
    .select()
    .single();

  if (error) throw toApiError(error, "Could not save your changes.");
  return rowToProject(data as ProjectRow);
}

export async function removeProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw toApiError(error, "Could not delete the project.");
}

export async function insertPayment(input: PaymentInput): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      project_id: input.projectId,
      amount: input.amount,
      paid_on: input.paidOn,
      note: input.note,
    })
    .select()
    .single();

  if (error) throw toApiError(error, "Could not record the payment.");
  return rowToPayment(data as PaymentRow);
}

export async function removePayment(id: string): Promise<void> {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw toApiError(error, "Could not delete the payment.");
}
