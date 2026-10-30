import { Columns3 } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { useLeads } from "@/features/leads/useLeads";
import KanbanBoard from "@/features/pipeline/KanbanBoard";

function PipelineSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-[1600px] flex-col gap-4"
    >
      <span className="sr-only">Loading pipeline…</span>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-96 w-72 shrink-0" />
        ))}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { leads, status, error, isLoading, reload } = useLeads();

  if (isLoading) return <PipelineSkeleton />;

  if (status === "failed") {
    return (
      <ErrorState
        message={error ?? "Could not load your pipeline."}
        onRetry={reload}
      />
    );
  }

  if (leads.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <EmptyState
            icon={Columns3}
            title="Your pipeline is empty"
            description="Add a lead and it will show up in the New column."
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

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
      <p className="text-sm text-muted">
        Drag a card by its handle to change its stage, or use the dropdown on
        the card.
      </p>
      <KanbanBoard leads={leads} />
    </div>
  );
}
