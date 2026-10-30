import { PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { PaymentStatusBadge } from "@/features/projects/ProjectBadges";
import type { OutstandingItem } from "@/features/reports/reportStats";
import { formatMoney } from "@/lib/format";

interface OutstandingPaymentsProps {
  items: OutstandingItem[];
  total: number;
}

export default function OutstandingPayments({
  items,
  total,
}: OutstandingPaymentsProps) {
  return (
    <Card className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Outstanding payments</h2>
          <p className="text-sm text-muted">Money still owed, largest first</p>
        </div>
        <p className="text-lg font-semibold tabular-nums">
          {formatMoney(total)}
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="Nothing outstanding"
          description="Every project is fully paid."
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {items.map((item) => (
            <li key={item.projectId} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/projects/${item.projectId}`}
                    className="block truncate text-sm font-medium hover:text-primary hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {item.clientName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatMoney(item.outstanding)}
                  </span>
                  <PaymentStatusBadge status={item.paymentStatus} />
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar
                  value={
                    item.budget > 0
                      ? Math.min(
                          Math.round((item.paid / item.budget) * 100),
                          100,
                        )
                      : 0
                  }
                  label={`${item.name} payment progress`}
                />
                <p className="mt-1 text-xs text-muted">
                  {formatMoney(item.paid)} of {formatMoney(item.budget)} paid
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
