import type { ReactNode } from "react";
import { CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge } from "@/features/leads/LeadBadges";
import { isFollowUpOverdue } from "@/features/leads/leadUtils";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  isLeadStatus,
} from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

interface LeadCardViewProps {
  lead: Lead;
  today: string;
  handle: ReactNode;
  onQuickMove?: (status: LeadStatus) => void;
  isMoving?: boolean;
  className?: string;
}

export default function LeadCardView({
  lead,
  today,
  handle,
  onQuickMove,
  isMoving = false,
  className,
}: LeadCardViewProps) {
  const overdue = isFollowUpOverdue(lead, today);

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-surface p-3 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {handle}
        <div className="min-w-0 flex-1">
          <Link
            to={`/leads/${lead.id}`}
            className="block truncate text-sm font-medium hover:text-primary hover:underline"
          >
            {lead.businessName}
          </Link>
          <p className="truncate text-xs text-muted">
            {lead.contactName || "No contact yet"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(lead.dealValue)}
        </span>
        <PriorityBadge priority={lead.priority} />
      </div>

      {lead.nextFollowUp && (
        <p
          className={cn(
            "mt-2 flex items-center gap-1.5 text-xs",
            overdue ? "font-medium text-danger" : "text-muted",
          )}
        >
          <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Follow-up {formatShortDate(lead.nextFollowUp)}
          {overdue && " (overdue)"}
        </p>
      )}

      {onQuickMove && (
        <select
          aria-label={`Move ${lead.businessName} to stage`}
          value={lead.status}
          disabled={isMoving}
          onChange={(event) => {
            const next = event.target.value;
            if (isLeadStatus(next)) onQuickMove(next);
          }}
          className="mt-3 h-8 w-full rounded-md border border-border bg-surface px-2 text-xs text-foreground disabled:opacity-50"
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {LEAD_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      )}
    </article>
  );
}
