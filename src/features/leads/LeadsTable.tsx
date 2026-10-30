import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import { PriorityBadge, StatusBadge } from "@/features/leads/LeadBadges";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Lead } from "@/types";

interface LeadsTableProps {
  leads: Lead[];
  today: string;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const th = "px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted";

export default function LeadsTable({
  leads,
  today,
  onEdit,
  onDelete,
}: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-md text-sm">
          <caption className="sr-only">Your leads</caption>
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className={`${th} text-left`}>
                Business
              </th>
              <th scope="col" className={`${th} text-left`}>
                Status
              </th>
              <th
                scope="col"
                className={`${th} hidden text-left md:table-cell`}
              >
                Priority
              </th>
              <th
                scope="col"
                className={`${th} hidden text-right sm:table-cell`}
              >
                Deal value
              </th>
              <th
                scope="col"
                className={`${th} hidden text-left lg:table-cell`}
              >
                Next follow-up
              </th>
              <th scope="col" className={`${th} text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const isOpen = lead.status !== "won" && lead.status !== "lost";
              const isOverdue =
                isOpen &&
                lead.nextFollowUp !== null &&
                lead.nextFollowUp < today;

              return (
                <tr
                  key={lead.id}
                  className="border-t border-border transition-colors hover:bg-surface-muted/50"
                >
                  <td className="max-w-56 px-4 py-3">
                    <Link
                      to={`/leads/${lead.id}`}
                      className="block truncate font-medium hover:text-primary hover:underline"
                    >
                      {lead.businessName}
                    </Link>
                    <span className="block truncate text-xs text-muted">
                      {lead.contactName || "No contact yet"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <PriorityBadge priority={lead.priority} />
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">
                    {formatCurrency(lead.dealValue)}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {lead.nextFollowUp ? (
                      <span
                        className={
                          isOverdue ? "font-medium text-danger" : "text-muted"
                        }
                      >
                        {formatShortDate(lead.nextFollowUp)}
                        {isOverdue && " (overdue)"}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(lead)}
                        aria-label={`Edit ${lead.businessName}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(lead)}
                        aria-label={`Delete ${lead.businessName}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
