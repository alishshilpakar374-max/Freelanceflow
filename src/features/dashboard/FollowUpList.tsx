import { CalendarCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { formatShortDate } from "@/lib/format";
import type { FollowUp } from "@/types";

interface FollowUpListProps {
  followUps: FollowUp[];
  today: string;
}

function DueBadge({ dueDate, today }: { dueDate: string; today: string }) {
  if (dueDate < today)
    return <Badge tone="danger">Overdue · {formatShortDate(dueDate)}</Badge>;
  if (dueDate === today) return <Badge tone="warning">Today</Badge>;
  return <Badge>{formatShortDate(dueDate)}</Badge>;
}

export default function FollowUpList({ followUps, today }: FollowUpListProps) {
  // .filter() returns a NEW array, so .sort() below can't mutate the original props.
  const pending = followUps
    .filter((followUp) => !followUp.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <Card className="min-w-0">
      <h2 className="text-base font-semibold">Follow-ups</h2>
      <p className="text-sm text-muted">Overdue first, then what's coming up</p>

      {pending.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="You're all caught up"
          description="No pending follow-ups. Schedule one from any lead."
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {pending.map((followUp) => (
            <li
              key={followUp.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{followUp.title}</p>
                <p className="truncate text-xs text-muted">
                  {followUp.leadName}
                </p>
              </div>
              <div className="shrink-0">
                <DueBadge dueDate={followUp.dueDate} today={today} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
