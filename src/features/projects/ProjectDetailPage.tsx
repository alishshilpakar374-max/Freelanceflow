import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Pencil, Receipt, SearchX, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toastAdded } from "@/components/layout/toastSlice";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ProgressBar from "@/components/ui/ProgressBar";
import Skeleton from "@/components/ui/Skeleton";
import { useLeads } from "@/features/leads/useLeads";
import PaymentForm from "@/features/projects/PaymentForm";
import {
  PaymentStatusBadge,
  ProjectStatusBadge,
} from "@/features/projects/ProjectBadges";
import ProjectFormModal from "@/features/projects/ProjectFormModal";
import {
  getProjectBalance,
  isProjectOverdue,
} from "@/features/projects/projectUtils";
import {
  deletePayment,
  deleteProject,
} from "@/features/projects/projectsSlice";
import { useProjects } from "@/features/projects/useProjects";
import { useAppDispatch } from "@/hooks/redux";
import { todayISO } from "@/lib/dates";
import { formatFullDate, formatMoney } from "@/lib/format";
import type { Payment } from "@/types";

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

function MoneyCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const projectsQuery = useProjects();
  const leadsQuery = useLeads();

  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);

  const { projects, payments } = projectsQuery;
  const { leads } = leadsQuery;
  const project = projects.find((item) => item.id === projectId);

  const projectPayments = useMemo(
    () =>
      payments
        .filter((payment) => payment.projectId === projectId)
        .sort((a, b) => b.paidOn.localeCompare(a.paidOn)),
    [payments, projectId],
  );

  if (projectsQuery.isLoading || leadsQuery.isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex max-w-5xl flex-col gap-4"
      >
        <span className="sr-only">Loading project…</span>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const failedQuery = [projectsQuery, leadsQuery].find(
    (query) => query.status === "failed",
  );
  if (failedQuery) {
    return (
      <ErrorState
        message={failedQuery.error ?? "Could not load this project."}
        onRetry={failedQuery.reload}
      />
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <EmptyState
            icon={SearchX}
            title="Project not found"
            description="It may have been deleted, or the link is wrong."
          />
          <div className="flex justify-center pb-4">
            <Link
              to="/projects"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Back to all projects
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const today = todayISO();
  const balance = getProjectBalance(project, projectPayments);
  const overdue = isProjectOverdue(project, today);
  const client = leads.find((lead) => lead.id === project.leadId);

  const confirmDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteProject(project.id));
    setIsDeleting(false);
    setConfirmingDelete(false);

    if (deleteProject.fulfilled.match(result)) {
      dispatch(toastAdded(`${project.name} deleted`));
      navigate("/projects");
    } else {
      dispatch(
        toastAdded(result.payload ?? "Could not delete the project.", "error"),
      );
    }
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    setIsDeletingPayment(true);
    const result = await dispatch(deletePayment(paymentToDelete.id));
    setIsDeletingPayment(false);
    setPaymentToDelete(null);

    if (deletePayment.fulfilled.match(result)) {
      dispatch(toastAdded("Payment deleted"));
    } else {
      dispatch(
        toastAdded(result.payload ?? "Could not delete the payment.", "error"),
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Link
        to="/projects"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <PaymentStatusBadge status={balance.status} />
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

      <div className="grid gap-4 sm:grid-cols-3">
        <MoneyCard label="Budget" value={formatMoney(project.budget)} />
        <MoneyCard label="Paid" value={formatMoney(balance.paid)} />
        <MoneyCard
          label="Outstanding"
          value={formatMoney(balance.outstanding)}
        />
      </div>

      <Card>
        <ProgressBar value={balance.progress} label="Payment progress" />
        <p className="mt-2 text-sm text-muted">
          {balance.progress}% of the budget has been paid
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="self-start">
          <h3 className="text-base font-semibold">Details</h3>
          <dl className="mt-4 flex flex-col gap-4">
            <DetailItem label="Client">
              {client ? (
                <Link
                  to={`/leads/${client.id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {client.businessName}
                </Link>
              ) : (
                "—"
              )}
            </DetailItem>
            <DetailItem label="Start date">
              {project.startDate ? formatFullDate(project.startDate) : "—"}
            </DetailItem>
            <DetailItem label="Deadline">
              {project.deadline ? (
                <span className="inline-flex flex-wrap items-center gap-2">
                  {formatFullDate(project.deadline)}
                  {overdue && <Badge tone="danger">Overdue</Badge>}
                </span>
              ) : (
                "—"
              )}
            </DetailItem>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold">Payments</h3>

          <div className="mt-4">
            <PaymentForm projectId={project.id} />
          </div>

          <div className="mt-5 border-t border-border pt-2">
            {projectPayments.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No payments yet"
                description="Record the first payment above."
              />
            ) : (
              <ul className="divide-y divide-border">
                {projectPayments.map((payment) => (
                  <li key={payment.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatMoney(payment.amount)}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {formatFullDate(payment.paidOn)}
                        {payment.note && ` · ${payment.note}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setPaymentToDelete(payment)}
                      aria-label={`Delete payment of ${formatMoney(payment.amount)}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <ProjectFormModal
        target={editing ? project : null}
        leads={leads}
        onClose={() => setEditing(false)}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this project?"
        message={`${project.name} and all its payments will be permanently removed. This can't be undone.`}
        confirmLabel="Delete project"
        busy={isDeleting}
        busyLabel="Deleting…"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ConfirmDialog
        open={paymentToDelete !== null}
        title="Delete this payment?"
        message={`The ${paymentToDelete ? formatMoney(paymentToDelete.amount) : ""} payment will be removed and the balance recalculated.`}
        confirmLabel="Delete payment"
        busy={isDeletingPayment}
        busyLabel="Deleting…"
        onConfirm={() => void confirmDeletePayment()}
        onCancel={() => setPaymentToDelete(null)}
      />
    </div>
  );
}
