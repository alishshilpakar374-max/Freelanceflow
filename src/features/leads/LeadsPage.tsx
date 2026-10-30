import { useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import LeadFormModal from "@/features/leads/LeadFormModal";
import LeadsTable from "@/features/leads/LeadsTable";
import LeadsToolbar from "@/features/leads/LeadsToolbar";
import {
  defaultLeadFilters,
  filterAndSortLeads,
} from "@/features/leads/leadFilters";
import type { LeadFilters } from "@/features/leads/leadFilters";
import { deleteLead } from "@/features/leads/leadsSlice";
import { useLeads } from "@/features/leads/useLeads";
import { useAppDispatch } from "@/hooks/redux";
import { todayISO } from "@/lib/dates";
import type { Lead } from "@/types";

function LeadsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-7xl flex-col gap-4"
    >
      <span className="sr-only">Loading leads…</span>
      <Skeleton className="h-10 w-full" />
      <Card className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </Card>
    </div>
  );
}

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const { leads, status, error, isLoading, reload } = useLeads();

  const [filters, setFilters] = useState<LeadFilters>(defaultLeadFilters);
  const [formTarget, setFormTarget] = useState<Lead | "new" | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const visibleLeads = useMemo(
    () => filterAndSortLeads(leads, filters),
    [leads, filters],
  );

  // Hooks are all above this line, so the early returns below are safe.
  if (isLoading) return <LeadsSkeleton />;

  if (status === "failed") {
    return (
      <ErrorState
        message={error ?? "Could not load your leads."}
        onRetry={reload}
      />
    );
  }

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    const lead = leadToDelete;

    setIsDeleting(true);
    const result = await dispatch(deleteLead(lead.id));
    setIsDeleting(false);
    setLeadToDelete(null); // close the dialog first: toasts would hide behind an open <dialog>

    if (deleteLead.fulfilled.match(result)) {
      dispatch(toastAdded(`${lead.businessName} deleted`));
    } else {
      dispatch(
        toastAdded(result.payload ?? "Could not delete the lead.", "error"),
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          Showing {visibleLeads.length} of {leads.length} leads
        </p>
        <Button onClick={() => setFormTarget("new")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add lead
        </Button>
      </div>

      <LeadsToolbar filters={filters} onChange={setFilters} />

      {leads.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No leads yet"
            description="Add your first lead to start tracking your pipeline."
          />
          <div className="flex justify-center pb-4">
            <Button onClick={() => setFormTarget("new")}>
              Add your first lead
            </Button>
          </div>
        </Card>
      ) : visibleLeads.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title="No leads match your filters"
            description="Try a different search term or clear the filters."
          />
          <div className="flex justify-center pb-4">
            <Button
              variant="secondary"
              onClick={() => setFilters(defaultLeadFilters)}
            >
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        <LeadsTable
          leads={visibleLeads}
          today={todayISO()}
          onEdit={setFormTarget}
          onDelete={setLeadToDelete}
        />
      )}

      <LeadFormModal target={formTarget} onClose={() => setFormTarget(null)} />

      <ConfirmDialog
        open={leadToDelete !== null}
        title="Delete this lead?"
        message={`${leadToDelete?.businessName ?? "This lead"} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete lead"
        busy={isDeleting}
        busyLabel="Deleting…"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setLeadToDelete(null)}
      />
    </div>
  );
}
