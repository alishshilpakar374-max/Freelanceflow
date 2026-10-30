import { useMemo } from "react";
import {
  BellRing,
  Briefcase,
  Hourglass,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import ErrorState from "@/components/ui/ErrorState";
import DashboardSkeleton from "@/features/dashboard/DashboardSkeleton";
import FollowUpList from "@/features/dashboard/FollowUpList";
import LeadFunnelChart from "@/features/dashboard/LeadFunnelChart";
import QuickActions from "@/features/dashboard/QuickActions";
import RecentActivity from "@/features/dashboard/RecentActivity";
import RevenueChart from "@/features/dashboard/RevenueChart";
import StatCard from "@/features/dashboard/StatCard";
import { getDashboardStats } from "@/features/dashboard/stats";
import { useDashboardData } from "@/features/dashboard/useDashboardData";
import { todayISO } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const { data, isLoading, error, reload } = useDashboardData();
  const today = todayISO();

  // Hooks must run on every render, so useMemo stays above early returns.
  const stats = useMemo(
    () => (data ? getDashboardStats(data, today) : null),
    [data, today],
  );

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (isLoading || !data || !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Here's how your freelance business is doing.
        </p>

        <QuickActions />
      </div>

      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          label="Total leads"
          value={String(stats.totalLeads)}
          hint={`${stats.conversionRate}% conversion rate`}
          icon={Users}
        />

        <StatCard
          label="Active projects"
          value={String(stats.activeProjects)}
          hint="Currently in progress"
          icon={Briefcase}
        />

        <StatCard
          label="Won clients"
          value={String(stats.wonClients)}
          icon={Trophy}
          tone="success"
        />

        <StatCard
          label="Revenue received"
          value={formatCurrency(stats.revenueReceived)}
          hint="All time"
          icon={Wallet}
          tone="success"
        />

        <StatCard
          label="Outstanding payments"
          value={formatCurrency(stats.outstandingPayments)}
          hint="Across all projects"
          icon={Hourglass}
          tone="warning"
        />

        <StatCard
          label="Overdue follow-ups"
          value={String(stats.overdueFollowUps)}
          hint={`${stats.upcomingFollowUps} upcoming`}
          icon={BellRing}
          tone={stats.overdueFollowUps > 0 ? "danger" : "success"}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <LeadFunnelChart
          data={stats.stageCounts}
          conversionRate={stats.conversionRate}
        />

        <RevenueChart data={stats.monthlyRevenue} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FollowUpList followUps={data.followUps} today={today} />

        <RecentActivity activities={data.activities} />
      </div>
    </div>
  );
}
