import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  Announcements,
  CollisionDetection,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { toastAdded } from "@/components/layout/toastSlice";
import { moveLead } from "@/features/leads/leadsSlice";
import KanbanColumn from "@/features/pipeline/KanbanColumn";
import LeadCardView from "@/features/pipeline/LeadCardView";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  isLeadStatus,
} from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import type { Lead, LeadStatus } from "@/types";

// Which column is the pointer inside? Keyboard dragging has no pointer,
// so we fall back to "which column does the dragged card overlap?".
const detectCollisions: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  return pointerHits.length > 0 ? pointerHits : rectIntersection(args);
};

interface KanbanBoardProps {
  leads: Lead[];
}

export default function KanbanBoard({ leads }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const movingIds = useAppSelector((state) => state.leads.movingIds);
  const [activeId, setActiveId] = useState<string | null>(null);
  const today = todayISO();

  const sensors = useSensors(
    // distance: 4 means "move 4px before a drag begins", so a plain click never starts one.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const leadsByStatus = useMemo(() => {
    const groups: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      replied: [],
      proposal_sent: [],
      won: [],
      lost: [],
    };
    for (const lead of leads) groups[lead.status].push(lead);
    for (const status of LEAD_STATUSES) {
      groups[status].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return groups;
  }, [leads]);

  const activeLead = activeId
    ? leads.find((lead) => lead.id === activeId)
    : undefined;

  const moveTo = async (lead: Lead, status: LeadStatus, announce: boolean) => {
    if (lead.status === status || movingIds.includes(lead.id)) return;

    const result = await dispatch(
      moveLead({ id: lead.id, status, previousStatus: lead.status }),
    );

    if (moveLead.rejected.match(result)) {
      dispatch(
        toastAdded(
          `Couldn't move ${lead.businessName}. It was put back in ${LEAD_STATUS_LABELS[lead.status]}.`,
          "error",
        ),
      );
    } else if (announce) {
      // Dragging is announced by dnd-kit itself. The dropdown path needs this toast,
      // which doubles as a screen-reader announcement (the toast area is aria-live).
      dispatch(
        toastAdded(
          `${lead.businessName} moved to ${LEAD_STATUS_LABELS[status]}`,
        ),
      );
    }
  };

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || !isLeadStatus(over.id)) return;

    const lead = leads.find((item) => item.id === active.id);
    if (lead) void moveTo(lead, over.id, false);
  };

  // Screen-reader messages. Without these, users would hear raw ids like "3f2a-91bc".
  const leadName = (id: UniqueIdentifier) =>
    leads.find((lead) => lead.id === id)?.businessName ?? "Lead";
  const stageLabel = (id: UniqueIdentifier | undefined) =>
    isLeadStatus(id) ? LEAD_STATUS_LABELS[id] : undefined;

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${leadName(active.id)}.`,
    onDragOver: ({ active, over }) => {
      const label = stageLabel(over?.id);
      return label ? `${leadName(active.id)} is over ${label}.` : undefined;
    },
    onDragEnd: ({ active, over }) => {
      const label = stageLabel(over?.id);
      return label
        ? `${leadName(active.id)} was dropped in ${label}.`
        : `${leadName(active.id)} was dropped. No change.`;
    },
    onDragCancel: ({ active }) =>
      `Dragging cancelled. ${leadName(active.id)} was not moved.`,
  };

  return (
    <DndContext
      id="pipeline-board"
      sensors={sensors}
      collisionDetection={detectCollisions}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="pipeline-h-scroll flex h-[calc(100dvh-10rem)] min-h-96 items-stretch gap-4 overflow-x-auto pb-2">
        {LEAD_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={leadsByStatus[status]}
            today={today}
            movingIds={movingIds}
            onQuickMove={(lead, nextStatus) =>
              void moveTo(lead, nextStatus, true)
            }
          />
        ))}
      </div>

      {/* The floating copy that follows your cursor. */}
      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <LeadCardView
            lead={activeLead}
            today={today}
            className="rotate-1 cursor-grabbing shadow-xl"
            handle={
              <span className="-ml-1 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-muted">
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </span>
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
