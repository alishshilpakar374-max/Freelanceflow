import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/constants";
import { lastMonths, monthKey } from "@/lib/dates";
import type { DashboardData } from "@/features/dashboard/types";
import { roundMoney } from "@/lib/money";

export interface StageCount {
  stage: string;
  count: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  totalLeads: number;
  activeProjects: number;
  wonClients: number;
  revenueReceived: number;
  outstandingPayments: number;
  overdueFollowUps: number;
  upcomingFollowUps: number;
  conversionRate: number;
  stageCounts: StageCount[];
  monthlyRevenue: MonthlyRevenue[];
}

export function getDashboardStats(
  data: DashboardData,
  today: string,
): DashboardStats {
  const { leads, projects, payments, followUps } = data;

  // Total paid per project
  const paidByProject = new Map<string, number>();

  for (const payment of payments) {
    paidByProject.set(
      payment.projectId,
      (paidByProject.get(payment.projectId) ?? 0) + payment.amount,
    );
  }

  // Outstanding is calculated per project, never below zero.
  const outstandingPayments = projects.reduce((total, project) => {
    const paid = paidByProject.get(project.id) ?? 0;
    return total + Math.max(project.budget - paid, 0);
  }, 0);

  const revenueByMonth = new Map<string, number>();

  for (const payment of payments) {
    const key = monthKey(payment.paidOn);
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + payment.amount);
  }

  const pendingFollowUps = followUps.filter((followUp) => !followUp.completed);

  const wonClients = leads.filter((lead) => lead.status === "won").length;

  return {
    totalLeads: leads.length,

    activeProjects: projects.filter(
      (project) => project.status === "in_progress",
    ).length,

    wonClients,

    revenueReceived: roundMoney(
      payments.reduce((total, payment) => total + payment.amount, 0),
    ),

    outstandingPayments: roundMoney(outstandingPayments),

    // ISO date strings compare correctly with < and >=.
    overdueFollowUps: pendingFollowUps.filter(
      (followUp) => followUp.dueDate < today,
    ).length,

    upcomingFollowUps: pendingFollowUps.filter(
      (followUp) => followUp.dueDate >= today,
    ).length,

    conversionRate:
      leads.length === 0 ? 0 : Math.round((wonClients / leads.length) * 100),

    stageCounts: LEAD_STATUSES.map((status) => ({
      stage: LEAD_STATUS_LABELS[status],
      count: leads.filter((lead) => lead.status === status).length,
    })),

    monthlyRevenue: lastMonths(6).map(({ key, label }) => ({
      month: label,
      revenue: roundMoney(revenueByMonth.get(key) ?? 0),
    })),
  };
}
