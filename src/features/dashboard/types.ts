import type { Activity, FollowUp, Lead, Payment, Project } from "@/types";

export interface DashboardData {
  leads: Lead[];
  projects: Project[];
  payments: Payment[];
  followUps: FollowUp[];
  activities: Activity[];
}
