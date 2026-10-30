import { useMemo } from "react";
import { useActivities } from "@/features/activities/useActivities";
import type { DashboardData } from "@/features/dashboard/types";
import { useFollowUps } from "@/features/follow-ups/useFollowUps";
import { useLeads } from "@/features/leads/useLeads";
import { useProjects } from "@/features/projects/useProjects";

export function useDashboardData() {
  const leadsQuery = useLeads();
  const activitiesQuery = useActivities();
  const followUpsQuery = useFollowUps();
  const projectsQuery = useProjects();

  const queries = [leadsQuery, activitiesQuery, followUpsQuery, projectsQuery];
  const failed = queries.find((query) => query.status === "failed");
  const ready = queries.every((query) => query.status === "succeeded");

  const { leads } = leadsQuery;
  const { activities } = activitiesQuery;
  const { followUps } = followUpsQuery;
  const { projects, payments } = projectsQuery;

  const data = useMemo<DashboardData | null>(() => {
    if (!ready) return null;

    const nameById = new Map(leads.map((lead) => [lead.id, lead.businessName]));
    const nameOf = (id: string) => nameById.get(id) ?? "Unknown lead";

    return {
      leads,
      projects,
      payments,
      followUps: followUps.map((item) => ({
        id: item.id,
        leadName: nameOf(item.leadId),
        title: item.title,
        dueDate: item.dueDate,
        completed: item.completedAt !== null,
      })),
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        leadName: nameOf(activity.leadId),
        summary: activity.summary,
        createdAt: activity.occurredAt,
      })),
    };
  }, [ready, leads, projects, payments, activities, followUps]);

  const reload = () => {
    for (const query of queries) {
      if (query.status === "failed") query.reload();
    }
  };

  return {
    data,
    isLoading: failed === undefined && data === null,
    error: failed ? (failed.error ?? "Could not load your dashboard.") : null,
    reload,
  };
}
