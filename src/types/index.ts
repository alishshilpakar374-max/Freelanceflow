export type LeadStatus =
  | "new"
  | "contacted"
  | "replied"
  | "proposal_sent"
  | "won"
  | "lost";

export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "completed"
  | "on_hold";

export interface Project {
  id: string;
  leadId: string;
  name: string;
  budget: number;
  startDate: string | null; // 'YYYY-MM-DD'
  deadline: string | null; // 'YYYY-MM-DD'
  status: ProjectStatus;
  createdAt: string;
}

export type ProjectInput = Omit<Project, "id" | "createdAt">;

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  paidOn: string; // 'YYYY-MM-DD'
  note: string;
}

export type PaymentInput = Omit<Payment, "id">;

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type ActivityType = "call" | "email" | "message" | "meeting" | "note";

export interface Activity {
  id: string;
  type: ActivityType;
  leadName: string;
  summary: string;
  createdAt: string; // full ISO datetime
}

export interface FollowUp {
  id: string;
  leadName: string;
  title: string;
  dueDate: string; // 'YYYY-MM-DD'
  completed: boolean;
}

export type LeadSource =
  | "referral"
  | "website"
  | "google_maps"
  | "social_media"
  | "job_board"
  | "other";

export type LeadPriority = "low" | "medium" | "high";

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  source: LeadSource;
  priority: LeadPriority;
  dealValue: number;
  status: LeadStatus;
  notes: string;
  nextFollowUp: string | null; // 'YYYY-MM-DD'
  createdAt: string; // full ISO datetime
}

export type LeadInput = Omit<Lead, "id" | "createdAt">;

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  summary: string;
  occurredAt: string; // full ISO datetime
}

export interface FollowUpTask {
  id: string;
  leadId: string;
  title: string;
  dueDate: string; // 'YYYY-MM-DD'
  completedAt: string | null;
}
