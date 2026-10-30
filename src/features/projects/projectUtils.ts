import { roundMoney } from "@/lib/money";
import type { Payment, PaymentStatus, Project } from "@/types";

export interface ProjectBalance {
  paid: number;
  outstanding: number;
  status: PaymentStatus;
  progress: number; // whole percent, 0-100
}

export function groupPayments(payments: Payment[]): Map<string, Payment[]> {
  const groups = new Map<string, Payment[]>();

  for (const payment of payments) {
    const list = groups.get(payment.projectId);
    if (list) list.push(payment);
    else groups.set(payment.projectId, [payment]);
  }

  return groups;
}

// Same rules as the project_balances view in the database.
export function getProjectBalance(
  project: Project,
  projectPayments: Payment[],
): ProjectBalance {
  const paidCents = projectPayments.reduce(
    (sum, payment) => sum + Math.round(payment.amount * 100),
    0,
  );
  const paid = paidCents / 100;

  const status: PaymentStatus =
    paidCents <= 0 ? "unpaid" : paid >= project.budget ? "paid" : "partial";

  return {
    paid,
    outstanding: roundMoney(Math.max(project.budget - paid, 0)),
    status,
    progress:
      project.budget > 0
        ? Math.min(Math.round((paid / project.budget) * 100), 100)
        : 0,
  };
}

export function isProjectOverdue(project: Project, today: string): boolean {
  return (
    project.deadline !== null &&
    project.deadline < today &&
    project.status !== "completed"
  );
}
