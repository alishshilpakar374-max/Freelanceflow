import type { Lead, LeadPriority, LeadStatus } from "@/types";

export type LeadSort = "newest" | "name" | "value" | "followUp";

export interface LeadFilters {
  search: string;
  status: LeadStatus | "all";
  priority: LeadPriority | "all";
  sort: LeadSort;
}

export const defaultLeadFilters: LeadFilters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "newest",
};

export const LEAD_SORT_LABELS: Record<LeadSort, string> = {
  newest: "Newest first",
  name: "Business name (A–Z)",
  value: "Deal value (high to low)",
  followUp: "Next follow-up (soonest)",
};

export function filterAndSortLeads(
  leads: Lead[],
  filters: LeadFilters,
): Lead[] {
  const query = filters.search.trim().toLowerCase();

  const matches = leads.filter((lead) => {
    if (filters.status !== "all" && lead.status !== filters.status)
      return false;
    if (filters.priority !== "all" && lead.priority !== filters.priority)
      return false;
    if (query === "") return true;

    return [
      lead.businessName,
      lead.contactName,
      lead.email,
      lead.phone,
      lead.website,
    ].some((field) => field.toLowerCase().includes(query));
  });

  // `matches` is a brand-new array, so sorting it can't mutate the Redux state.
  return matches.sort((a, b) => {
    switch (filters.sort) {
      case "name":
        return a.businessName.localeCompare(b.businessName);
      case "value":
        return b.dealValue - a.dealValue;
      case "followUp":
        // Leads without a follow-up date sink to the bottom.
        return (a.nextFollowUp ?? "9999-12-31").localeCompare(
          b.nextFollowUp ?? "9999-12-31",
        );
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}
