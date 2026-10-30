import type { ComponentProps } from "react";
import Badge from "@/components/ui/Badge";
import { PAYMENT_STATUS_LABELS, PROJECT_STATUS_LABELS } from "@/lib/constants";
import type { PaymentStatus, ProjectStatus } from "@/types";

type BadgeTone = NonNullable<ComponentProps<typeof Badge>["tone"]>;

const projectTones: Record<ProjectStatus, BadgeTone> = {
  planning: "neutral",
  in_progress: "primary",
  completed: "success",
  on_hold: "warning",
};

const paymentTones: Record<PaymentStatus, BadgeTone> = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge tone={projectTones[status]}>{PROJECT_STATUS_LABELS[status]}</Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge tone={paymentTones[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>
  );
}
