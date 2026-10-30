import { Briefcase } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { ProjectStatusBadge } from "@/features/projects/ProjectBadges";
import type { ProjectStatusStat } from "@/features/reports/reportStats";
import { formatMoney } from "@/lib/format";

interface ProjectStatusSummaryProps {
  stats: ProjectStatusStat[];
}

export default function ProjectStatusSummary({
  stats,
}: ProjectStatusSummaryProps) {
  const totalProjects = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="min-w-0">
      <h2 className="text-base font-semibold">Project status</h2>
      <p className="text-sm text-muted">How many projects are in each stage</p>

      {totalProjects === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Create a project to see it summarised here."
        />
      ) : (
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">
            Projects and total budget by status
          </caption>
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th scope="col" className="py-2 font-medium">
                Status
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Projects
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Budget
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((item) => (
              <tr key={item.status} className="border-t border-border">
                <td className="py-3">
                  <ProjectStatusBadge status={item.status} />
                </td>
                <td className="py-3 text-right tabular-nums">{item.count}</td>
                <td className="py-3 text-right tabular-nums">
                  {formatMoney(item.budget)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
