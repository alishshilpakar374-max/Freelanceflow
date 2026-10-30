import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
} from "@/lib/constants";
import { lastMonths, monthKey } from "@/lib/dates";
import { roundMoney } from "@/lib/money";
import {
  getProjectBalance,
  groupPayments,
} from "@/features/projects/projectUtils";
import type {
  Lead,
  Payment,
  PaymentStatus,
  Project,
  ProjectStatus,
} from "@/types";

export interface StageCount {
  stage: string;
  count: number;
}

export interface SourceStat {
  source: string;
  leads: number;
  won: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ProjectStatusStat {
  status: ProjectStatus;
  label: string;
  count: number;
  budget: number;
}

export interface OutstandingItem {
  projectId: string;
  name: string;
  clientName: string;
  budget: number;
  paid: number;
  outstanding: number;
  paymentStatus: PaymentStatus;
}

export interface ReportStats {
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number; // won / all leads, whole percent (same rule as the dashboard)
  winRate: number; // won / (won + lost), whole percent
  stageCounts: StageCount[];
  sourceStats: SourceStat[];
  monthlyRevenue: MonthlyRevenue[];
  totalRevenue: number;
  totalBudget: number;
  totalOutstanding: number;
  collectionRate: number; // paid / budget, whole percent
  projectStatusStats: ProjectStatusStat[];
  outstandingItems: OutstandingItem[];
}

const percent = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

export function getReportStats(
  leads: Lead[],
  projects: Project[],
  payments: Payment[],
): ReportStats {
  const wonLeads = leads.filter((lead) => lead.status === "won").length;
  const lostLeads = leads.filter((lead) => lead.status === "lost").length;

  const sourceStats = LEAD_SOURCES.map((source) => {
    const inSource = leads.filter((lead) => lead.source === source);
    return {
      source: LEAD_SOURCE_LABELS[source],
      leads: inSource.length,
      won: inSource.filter((lead) => lead.status === "won").length,
    };
  }).sort((a, b) => b.leads - a.leads);

  const revenueByMonth = new Map<string, number>();
  for (const payment of payments) {
    const key = monthKey(payment.paidOn);
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + payment.amount);
  }

  const clientNameById = new Map(
    leads.map((lead) => [lead.id, lead.businessName]),
  );
  const paymentsByProject = groupPayments(payments);

  let totalPaid = 0;
  let totalBudget = 0;
  let totalOutstanding = 0;
  const outstandingItems: OutstandingItem[] = [];

  for (const project of projects) {
    const balance = getProjectBalance(
      project,
      paymentsByProject.get(project.id) ?? [],
    );

    totalBudget += project.budget;
    totalPaid += balance.paid;
    totalOutstanding += balance.outstanding;

    if (balance.outstanding > 0) {
      outstandingItems.push({
        projectId: project.id,
        name: project.name,
        clientName: clientNameById.get(project.leadId) ?? "Unknown client",
        budget: project.budget,
        paid: balance.paid,
        outstanding: balance.outstanding,
        paymentStatus: balance.status,
      });
    }
  }

  outstandingItems.sort((a, b) => b.outstanding - a.outstanding);

  return {
    totalLeads: leads.length,
    wonLeads,
    lostLeads,
    conversionRate: percent(wonLeads, leads.length),
    winRate: percent(wonLeads, wonLeads + lostLeads),
    stageCounts: LEAD_STATUSES.map((status) => ({
      stage: LEAD_STATUS_LABELS[status],
      count: leads.filter((lead) => lead.status === status).length,
    })),
    sourceStats,
    monthlyRevenue: lastMonths(12).map(({ key, label }) => ({
      month: label,
      revenue: roundMoney(revenueByMonth.get(key) ?? 0),
    })),
    totalRevenue: roundMoney(
      payments.reduce((sum, payment) => sum + payment.amount, 0),
    ),
    totalBudget: roundMoney(totalBudget),
    totalOutstanding: roundMoney(totalOutstanding),
    collectionRate: percent(totalPaid, totalBudget),
    projectStatusStats: PROJECT_STATUSES.map((status) => {
      const inStatus = projects.filter((project) => project.status === status);
      return {
        status,
        label: PROJECT_STATUS_LABELS[status],
        count: inStatus.length,
        budget: roundMoney(
          inStatus.reduce((sum, project) => sum + project.budget, 0),
        ),
      };
    }),
    outstandingItems,
  };
}
