import type {
  ActivityType,
  LeadPriority,
  LeadSource,
  LeadStatus,
  PaymentStatus,
  ProjectStatus,
} from "@/types";

// Order matters: the Kanban pipeline reuses this order.
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "replied",
  "proposal_sent",
  "won",
  "lost",
] as const satisfies readonly LeadStatus[];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

export const LEAD_PRIORITIES = [
  "low",
  "medium",
  "high",
] as const satisfies readonly LeadPriority[];

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const LEAD_SOURCES = [
  "referral",
  "website",
  "google_maps",
  "social_media",
  "job_board",
  "other",
] as const satisfies readonly LeadSource[];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  referral: "Referral",
  website: "Website",
  social_media: "Social media",
  google_maps: "Google maps",
  job_board: "Job board",
  other: "Other",
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    (LEAD_STATUSES as readonly string[]).includes(value)
  );
}

export function isLeadSource(value: unknown): value is LeadSource {
  return (
    typeof value === "string" &&
    (LEAD_SOURCES as readonly string[]).includes(value)
  );
}

export function isLeadPriority(value: unknown): value is LeadPriority {
  return (
    typeof value === "string" &&
    (LEAD_PRIORITIES as readonly string[]).includes(value)
  );
}

export const ACTIVITY_TYPES = [
  "call",
  "email",
  "message",
  "meeting",
  "note",
] as const satisfies readonly ActivityType[];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: "Call",
  email: "Email",
  message: "Message",
  meeting: "Meeting",
  note: "Note",
};

export function isActivityType(value: unknown): value is ActivityType {
  return (
    typeof value === "string" &&
    (ACTIVITY_TYPES as readonly string[]).includes(value)
  );
}

export const PROJECT_STATUSES = [
  "planning",
  "in_progress",
  "completed",
  "on_hold",
] as const satisfies readonly ProjectStatus[];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In progress",
  completed: "Completed",
  on_hold: "On hold",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partially paid",
  paid: "Paid",
};

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return (
    typeof value === "string" &&
    (PROJECT_STATUSES as readonly string[]).includes(value)
  );
}
