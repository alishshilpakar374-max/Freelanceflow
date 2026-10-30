import {
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  StickyNote,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/format";
import type { Activity, ActivityType } from "@/types";

const activityIcons: Record<ActivityType, LucideIcon> = {
  call: Phone,
  email: Mail,
  message: MessageSquare,
  meeting: Users,
  note: StickyNote,
};

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  // Spread into a copy first: .sort() mutates the array it is called on!
  const recent = [...activities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <Card className="min-w-0">
      <h2 className="text-base font-semibold">Recent activity</h2>
      <p className="text-sm text-muted">Your latest calls, emails and notes</p>

      {recent.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No activity yet"
          description="Log a call, email or note and it will show up here."
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {recent.map((activity) => {
            const Icon = activityIcons[activity.type];
            return (
              <li key={activity.id} className="flex items-start gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm">{activity.summary}</p>
                  <p className="truncate text-xs text-muted">
                    {activity.leadName} ·{" "}
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
