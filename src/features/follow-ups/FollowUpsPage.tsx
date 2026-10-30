import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toastAdded } from "@/components/layout/toastSlice";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import FollowUpFormModal from "@/features/follow-ups/FollowUpFormModal";
import {
  deleteFollowUp,
  toggleFollowUp,
} from "@/features/follow-ups/followUpsSlice";
import { useFollowUps } from "@/features/follow-ups/useFollowUps";
import { useLeads } from "@/features/leads/useLeads";
import { useAppDispatch } from "@/hooks/redux";
import { todayISO } from "@/lib/dates";
import { formatLongDate, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FollowUpTask } from "@/types";

type Filter = "upcoming" | "overdue" | "completed";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue", label: "Overdue" },
  { value: "completed", label: "Completed" },
];

const EMPTY_COPY: Record<Filter, { title: string; description: string }> = {
  upcoming: {
    title: "Nothing upcoming",
    description: "Add a follow-up to stay on top of your leads.",
  },
  overdue: { title: "Nothing overdue", description: "You're all caught up." },
  completed: {
    title: "Nothing completed yet",
    description: "Completed follow-ups will show up here.",
  },
};

function PageSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-3xl flex-col gap-4"
    >
      <span className="sr-only">Loading follow-ups…</span>
      <Skeleton className="h-10 w-full" />
      <Card className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </Card>
    </div>
  );
}

function DueBadge({ item, today }: { item: FollowUpTask; today: string }) {
  if (item.completedAt)
    return (
      <Badge tone="success">Done {formatLongDate(item.completedAt)}</Badge>
    );
  if (item.dueDate < today)
    return (
      <Badge tone="danger">Overdue · {formatShortDate(item.dueDate)}</Badge>
    );
  if (item.dueDate === today) return <Badge tone="warning">Today</Badge>;
  return <Badge>{formatShortDate(item.dueDate)}</Badge>;
}

export default function FollowUpsPage() {
  const dispatch = useAppDispatch();
  const followUpsQuery = useFollowUps();
  const leadsQuery = useLeads();

  const [filter, setFilter] = useState<Filter>("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { followUps } = followUpsQuery;
  const { leads } = leadsQuery;
  const today = todayISO();

  const leadNameById = useMemo(
    () => new Map(leads.map((lead) => [lead.id, lead.businessName])),
    [leads],
  );

  const grouped = useMemo(() => {
    const pending = followUps.filter((item) => item.completedAt === null);
    return {
      upcoming: pending
        .filter((item) => item.dueDate >= today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      overdue: pending
        .filter((item) => item.dueDate < today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      completed: followUps
        .filter((item) => item.completedAt !== null)
        .sort((a, b) =>
          (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
        ),
    };
  }, [followUps, today]);

  if (followUpsQuery.isLoading || leadsQuery.isLoading) return <PageSkeleton />;

  const failedQuery = [followUpsQuery, leadsQuery].find(
    (query) => query.status === "failed",
  );
  if (failedQuery) {
    return (
      <ErrorState
        message={failedQuery.error ?? "Could not load your follow-ups."}
        onRetry={failedQuery.reload}
      />
    );
  }

  if (leads.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <EmptyState
            icon={Users}
            title="Add a lead first"
            description="Follow-ups are attached to leads."
          />
          <div className="flex justify-center pb-4">
            <Link
              to="/leads"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Go to leads
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleToggle = async (item: FollowUpTask) => {
    setBusyId(item.id);
    const result = await dispatch(
      toggleFollowUp({ id: item.id, completed: item.completedAt === null }),
    );
    setBusyId(null);

    if (toggleFollowUp.rejected.match(result)) {
      dispatch(
        toastAdded(
          result.payload ?? "Could not update the follow-up.",
          "error",
        ),
      );
    }
  };

  const handleDelete = async (item: FollowUpTask) => {
    setBusyId(item.id);
    const result = await dispatch(deleteFollowUp(item.id));
    setBusyId(null);

    if (deleteFollowUp.rejected.match(result)) {
      dispatch(
        toastAdded(
          result.payload ?? "Could not delete the follow-up.",
          "error",
        ),
      );
    }
  };

  const visible = grouped[filter];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter follow-ups"
          className="inline-flex rounded-lg border border-border bg-surface-muted p-1"
        >
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "h-8 rounded-md px-3 text-sm font-medium transition-colors",
                filter === value
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {label} ({grouped[value].length})
            </button>
          ))}
        </div>

        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add follow-up
        </Button>
      </div>

      <Card className="p-0">
        {visible.length === 0 ? (
          <EmptyState icon={CalendarCheck} {...EMPTY_COPY[filter]} />
        ) : (
          <ul className="divide-y divide-border px-4">
            {visible.map((item) => {
              const done = item.completedAt !== null;
              const busy = busyId === item.id;

              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleToggle(item)}
                    aria-label={
                      done
                        ? `Mark "${item.title}" as not done`
                        : `Mark "${item.title}" as done`
                    }
                    className="shrink-0 rounded-full text-muted transition-colors hover:text-primary disabled:opacity-50"
                  >
                    {done ? (
                      <CheckCircle2
                        className="h-5 w-5 text-success"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        done && "text-muted line-through",
                      )}
                    >
                      {item.title}
                    </p>
                    <Link
                      to={`/leads/${item.leadId}`}
                      className="block truncate text-xs text-muted hover:text-foreground hover:underline"
                    >
                      {leadNameById.get(item.leadId) ?? "Unknown lead"}
                    </Link>
                  </div>

                  <div className="shrink-0">
                    <DueBadge item={item} today={today} />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={busy}
                    onClick={() => void handleDelete(item)}
                    aria-label={`Delete follow-up "${item.title}"`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <FollowUpFormModal
        open={formOpen}
        leads={leads}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
