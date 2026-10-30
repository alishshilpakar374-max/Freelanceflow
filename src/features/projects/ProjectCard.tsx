import { CalendarClock, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  PaymentStatusBadge,
  ProjectStatusBadge,
} from "@/features/projects/ProjectBadges";
import { isProjectOverdue } from "@/features/projects/projectUtils";
import type { ProjectBalance } from "@/features/projects/projectUtils";
import { formatMoney, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  clientName: string;
  balance: ProjectBalance;
  today: string;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function ProjectCard({
  project,
  clientName,
  balance,
  today,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const overdue = isProjectOverdue(project, today);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/projects/${project.id}`}
            className="block truncate text-base font-semibold hover:text-primary hover:underline"
          >
            {project.name}
          </Link>
          <p className="truncate text-sm text-muted">{clientName}</p>
        </div>
        <div className="-mr-2 -mt-2 flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ProjectStatusBadge status={project.status} />
        <PaymentStatusBadge status={balance.status} />
      </div>

      <div>
        <ProgressBar
          value={balance.progress}
          label={`${project.name} payment progress`}
        />
        <p className="mt-1.5 text-xs text-muted">
          {formatMoney(balance.paid)} of {formatMoney(project.budget)} paid (
          {balance.progress}%)
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span>
          <span className="text-muted">Outstanding </span>
          <span className="font-semibold tabular-nums">
            {formatMoney(balance.outstanding)}
          </span>
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs",
            overdue ? "font-medium text-danger" : "text-muted",
          )}
        >
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          {project.deadline
            ? `${overdue ? "Overdue · " : "Due "}${formatShortDate(project.deadline)}`
            : "No deadline"}
        </span>
      </div>
    </Card>
  );
}
