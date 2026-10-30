import type { ComponentProps } from "react";
import Badge from "@/components/ui/Badge";
import { LEAD_PRIORITY_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants";
import type { LeadPriority, LeadStatus } from "@/types";

type BadgeTone = NonNullable<ComponentProps<typeof Badge>["tone"]>;

const statusTones: Record<LeadStatus, BadgeTone> = {
  new: "neutral",
  contacted: "primary",
  replied: "primary",
  proposal_sent: "warning",
  won: "success",
  lost: "danger",
};

const priorityTones: Record<LeadPriority, BadgeTone> = {
  low: "neutral",
  medium: "primary",
  high: "danger",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={statusTones[status]}>{LEAD_STATUS_LABELS[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <Badge tone={priorityTones[priority]}>
      {LEAD_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
