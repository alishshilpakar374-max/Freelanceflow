import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import LeadCardView from "@/features/pipeline/LeadCardView";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

interface DraggableLeadCardProps {
  lead: Lead;
  today: string;
  isMoving: boolean;
  onQuickMove: (lead: Lead, status: LeadStatus) => void;
}

export default function DraggableLeadCard({
  lead,
  today,
  isMoving,
  onQuickMove,
}: DraggableLeadCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: lead.id,
      disabled: isMoving,
    });

  return (
    <div
      ref={setNodeRef}
      className={cn(isDragging && "opacity-40", isMoving && "opacity-60")}
    >
      <LeadCardView
        lead={lead}
        today={today}
        isMoving={isMoving}
        onQuickMove={(status) => onQuickMove(lead, status)}
        handle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag ${lead.businessName}`}
            className="-ml-1 mt-0.5 flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted hover:bg-surface-muted hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      />
    </div>
  );
}
