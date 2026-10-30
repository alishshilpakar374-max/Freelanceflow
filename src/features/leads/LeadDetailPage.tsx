import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Pencil, SearchX, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { toastAdded } from "@/components/layout/toastSlice";
import ErrorState from "@/components/ui/ErrorState";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

import { PriorityBadge, StatusBadge } from "@/features/leads/LeadBadges";
import LeadFormModal from "@/features/leads/LeadFormModal";
import { deleteLead } from "@/features/leads/leadsSlice";
import { useLeads } from "@/features/leads/useLeads";

import { useAppDispatch } from "@/hooks/redux";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { formatCurrency, formatLongDate, formatShortDate } from "@/lib/format";
import { normalizeWebsite } from "@/lib/url";
import ActivityLog from "@/features/activities/ActivityLog";

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 wrap-break-word text-sm">{children}</dd>
    </div>
  );
}

const linkClass = "text-primary underline-offset-4 hover:underline";

export default function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { leads, status, error, isLoading, reload } = useLeads();
  const lead = leads.find((item) => item.id === leadId);

  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex max-w-5xl flex-col gap-4"
      >
        <span className="sr-only">Loading lead…</span>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <ErrorState
        message={error ?? "Could not load this lead."}
        onRetry={reload}
      />
    );
  }

  if (!lead) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <EmptyState
            icon={SearchX}
            title="Lead not found"
            description="It may have been deleted, or the link is wrong."
          />
          <div className="flex justify-center pb-4">
            <Link to="/leads" className={linkClass}>
              Back to all leads
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isOpen = lead.status !== "won" && lead.status !== "lost";

  const isOverdue =
    isOpen && lead.nextFollowUp !== null && lead.nextFollowUp < todayISO();

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await dispatch(deleteLead(lead.id));

      if (deleteLead.fulfilled.match(result)) {
        dispatch(toastAdded(`${lead.businessName} deleted`));
        navigate("/leads");
      } else {
        dispatch(
          toastAdded(result.payload ?? "Could not delete the lead.", "error"),
        );
      }
    } catch {
      dispatch(toastAdded("Could not delete the lead.", "error"));
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Link
        to="/leads"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All leads
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">
            {lead.businessName}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Button>

          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <h3 className="text-base font-semibold">Details</h3>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Contact person">
                {lead.contactName || "—"}
              </DetailItem>

              <DetailItem label="Email">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className={linkClass}>
                    {lead.email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailItem>

              <DetailItem label="Phone">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className={linkClass}
                  >
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </DetailItem>

              <DetailItem label="Website">
                {lead.website ? (
                  <a
                    href={normalizeWebsite(lead.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {lead.website}
                  </a>
                ) : (
                  "—"
                )}
              </DetailItem>

              <DetailItem label="Source">
                {LEAD_SOURCE_LABELS[lead.source]}
              </DetailItem>

              <DetailItem label="Estimated deal value">
                {formatCurrency(lead.dealValue)}
              </DetailItem>

              <DetailItem label="Next follow-up">
                {lead.nextFollowUp ? (
                  <span className="inline-flex items-center gap-2">
                    {formatShortDate(lead.nextFollowUp)}
                    {isOverdue && <Badge tone="danger">Overdue</Badge>}
                  </span>
                ) : (
                  "—"
                )}
              </DetailItem>

              <DetailItem label="Added">
                {formatLongDate(lead.createdAt)}
              </DetailItem>
            </dl>
          </Card>

          <Card>
            <h3 className="text-base font-semibold">Notes</h3>

            {lead.notes ? (
              <p className="mt-3 whitespace-pre-wrap text-sm">{lead.notes}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No notes yet. Use Edit to add some.
              </p>
            )}
          </Card>
        </div>

        <ActivityLog leadId={lead.id} />
      </div>

      <LeadFormModal
        target={editing ? lead : null}
        onClose={() => setEditing(false)}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this lead?"
        message={`${lead.businessName} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete lead"
        busy={isDeleting}
        busyLabel="Deleting…"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
