import type { Lead } from "@/types";

export function isLeadOpen(lead: Lead): boolean {
  return lead.status !== "won" && lead.status !== "lost";
}

export function isFollowUpOverdue(lead: Lead, today: string): boolean {
  return (
    isLeadOpen(lead) && lead.nextFollowUp !== null && lead.nextFollowUp < today
  );
}
