import { useMemo } from "react";
import { BarChart3, Banknote, Hourglass, Percent, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import RevenueChart from "@/features/dashboard/RevenueChart";
import StatCard from "@/features/dashboard/StatCard";
import LeadFunnelChart from "@/features/dashboard/LeadFunnelChart";
import { useLeads } from "@/features/leads/useLeads";
import { useProjects } from "@/features/projects/useProjects";
import LeadsBySourceChart from "@/features/reports/LeadsBySourceChart";
import OutstandingPayments from "@/features/reports/OutstandingPayments";
import ProjectStatusSummary from "@/features/reports/ProjectStatusSummary";
import { getReportStats } from "@/features/reports/reportStats";
import { formatMoney } from "@/lib/format";

function ReportsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-7xl flex-col gap-6"
    >
      <span className="sr-only">Loading reports…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-52 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const leadsQuery = useLeads();
  const projectsQuery = useProjects();

  const { leads } = leadsQuery;
  const { projects, payments } = projectsQuery;

  const stats = useMemo(
    () => getReportStats(leads, projects, payments),
    [leads, projects, payments],
  );

  if (leadsQuery.isLoading || projectsQuery.isLoading)
    return <ReportsSkeleton />;

  const failedQuery = [leadsQuery, projectsQuery].find(
    (query) => query.status === "failed",
  );
  if (failedQuery) {
    return (
      <ErrorState
        message={failedQuery.error ?? "Could not load your reports."}
        onRetry={failedQuery.reload}
      />
    );
  }

  if (leads.length === 0 && projects.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No data to report yet"
            description="Add leads and projects, and your reports will appear here."
          />
          <div className="flex justify-center pb-4">
            <Link
              to="/leads"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Go to leads
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section
        aria-label="Key figures"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Lead conversion rate"
          value={`${stats.conversionRate}%`}
          hint={`${stats.wonLeads} won of ${stats.totalLeads} leads`}
          icon={Percent}
        />
        <StatCard
          label="Win rate (closed deals)"
          value={`${stats.winRate}%`}
          hint={`${stats.wonLeads} won, ${stats.lostLeads} lost`}
          icon={Target}
          tone="success"
        />
        <StatCard
          label="Revenue received"
          value={formatMoney(stats.totalRevenue)}
          hint={`${stats.collectionRate}% of ${formatMoney(stats.totalBudget)} budgeted`}
          icon={Banknote}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(stats.totalOutstanding)}
          hint={`${stats.outstandingItems.length} ${stats.outstandingItems.length === 1 ? "project" : "projects"} unpaid`}
          icon={Hourglass}
          tone="warning"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <LeadFunnelChart
          data={stats.stageCounts}
          conversionRate={stats.conversionRate}
        />
        <LeadsBySourceChart data={stats.sourceStats} />
      </div>

      <RevenueChart
        data={stats.monthlyRevenue}
        description="Payments received, last 12 months"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ProjectStatusSummary stats={stats.projectStatusStats} />
        <OutstandingPayments
          items={stats.outstandingItems}
          total={stats.totalOutstanding}
        />
      </div>
    </div>
  );
}
