import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import FormField from "@/components/ui/FormField";
import { fieldClass, textareaClass } from "@/components/ui/fieldStyles";
import Skeleton from "@/components/ui/Skeleton";
import {
  createActivity,
  deleteActivity,
} from "@/features/activities/activitiesSlice";
import { activityIcons } from "@/features/activities/activityMeta";
import { activityFormSchema } from "@/features/activities/activitySchema";
import type { ActivityFormValues } from "@/features/activities/activitySchema";
import { useActivities } from "@/features/activities/useActivities";
import { useAppDispatch } from "@/hooks/redux";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { formatLongDate, formatRelativeTime } from "@/lib/format";

interface ActivityLogProps {
  leadId: string;
}

export default function ActivityLog({ leadId }: ActivityLogProps) {
  const dispatch = useAppDispatch();
  const { activities, status, error, isLoading, reload } = useActivities();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const leadActivities = useMemo(
    () => activities.filter((activity) => activity.leadId === leadId),
    [activities, leadId],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: { type: "call", summary: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(createActivity({ leadId, ...values }));

    if (createActivity.fulfilled.match(result)) {
      reset({ type: values.type, summary: "" }); // keep the chosen type for quick repeat logging
      dispatch(toastAdded("Activity logged"));
    } else {
      dispatch(
        toastAdded(result.payload ?? "Could not log the activity.", "error"),
      );
    }
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await dispatch(deleteActivity(id));
    setDeletingId(null);

    if (deleteActivity.rejected.match(result)) {
      dispatch(
        toastAdded(result.payload ?? "Could not delete the activity.", "error"),
      );
    }
  };

  return (
    <Card className="self-start">
      <h3 className="text-base font-semibold">Communication history</h3>

      <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-3">
        <FormField label="Type" error={errors.type?.message}>
          {(control) => (
            <select className={fieldClass} {...control} {...register("type")}>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACTIVITY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="What happened?" error={errors.summary?.message}>
          {(control) => (
            <textarea
              rows={2}
              placeholder="e.g. Called, asked for portfolio examples"
              className={textareaClass}
              {...control}
              {...register("summary")}
            />
          )}
        </FormField>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging…" : "Log activity"}
        </Button>
      </form>

      <div className="mt-5 border-t border-border pt-2">
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col gap-3 py-3"
          >
            <span className="sr-only">Loading activity…</span>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : status === "failed" ? (
          <div role="alert" className="py-4 text-center">
            <p className="text-sm text-danger">
              {error ?? "Could not load activity."}
            </p>
            <Button variant="secondary" onClick={reload} className="mt-3">
              Try again
            </Button>
          </div>
        ) : leadActivities.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nothing logged yet"
            description="Log your first call, email or note above."
          />
        ) : (
          <ul className="divide-y divide-border">
            {leadActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const label = ACTIVITY_TYPE_LABELS[activity.type];

              return (
                <li key={activity.id} className="flex items-start gap-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap wrap-break-word text-sm">
                      {activity.summary}
                    </p>
                    <p className="text-xs text-muted">
                      {label} ·{" "}
                      <time
                        dateTime={activity.occurredAt}
                        title={formatLongDate(activity.occurredAt)}
                      >
                        {formatRelativeTime(activity.occurredAt)}
                      </time>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mr-2 -mt-1 h-8 w-8"
                    disabled={deletingId === activity.id}
                    onClick={() => void handleDelete(activity.id)}
                    aria-label={`Delete ${label.toLowerCase()} activity`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
