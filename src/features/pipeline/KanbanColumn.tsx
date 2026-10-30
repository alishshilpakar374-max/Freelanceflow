import { useId } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Inbox } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import DraggableLeadCard from "@/features/pipeline/DraggableLeadCard";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  today: string;
  movingIds: string[];
  onQuickMove: (lead: Lead, status: LeadStatus) => void;
}

export default function KanbanColumn({
  status,
  leads,
  today,
  movingIds,
  onQuickMove,
}: KanbanColumnProps) {
  const headingId = useId();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const totalValue = leads.reduce((sum, lead) => sum + lead.dealValue, 0);

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-surface-muted/40"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1 pt-3">
        <div className="flex items-center gap-2">
          <h2 id={headingId} className="text-sm font-semibold">
            {LEAD_STATUS_LABELS[status]}
          </h2>
          <Badge>{leads.length}</Badge>
        </div>
        <span className="text-xs tabular-nums text-muted">
          {formatCurrency(totalValue)}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "no-scroll-y flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-b-xl p-2 transition-colors",
          isOver && "bg-primary/10",
        )}
      >
        {leads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing here yet"
            description="Drag a lead into this stage."
          />
        ) : (
          leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              today={today}
              isMoving={movingIds.includes(lead.id)}
              onQuickMove={onQuickMove}
            />
          ))
        )}
      </div>
    </section>
  );
}
