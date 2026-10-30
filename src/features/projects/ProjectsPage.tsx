import { useMemo, useState } from "react";
import { Briefcase, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { useLeads } from "@/features/leads/useLeads";
import ProjectCard from "@/features/projects/ProjectCard";
import ProjectFormModal from "@/features/projects/ProjectFormModal";
import {
  getProjectBalance,
  groupPayments,
} from "@/features/projects/projectUtils";
import { deleteProject } from "@/features/projects/projectsSlice";
import { useProjects } from "@/features/projects/useProjects";
import { useAppDispatch } from "@/hooks/redux";
import { todayISO } from "@/lib/dates";
import type { Project } from "@/types";

function PageSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <span className="sr-only">Loading projects…</span>
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-32" />
        </Card>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const projectsQuery = useProjects();
  const leadsQuery = useLeads();

  const [formTarget, setFormTarget] = useState<Project | "new" | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { projects, payments } = projectsQuery;
  const { leads } = leadsQuery;
  const today = todayISO();

  const leadNameById = useMemo(
    () => new Map(leads.map((lead) => [lead.id, lead.businessName])),
    [leads],
  );
  const paymentsByProject = useMemo(() => groupPayments(payments), [payments]);

  if (projectsQuery.isLoading || leadsQuery.isLoading) return <PageSkeleton />;

  const failedQuery = [projectsQuery, leadsQuery].find(
    (query) => query.status === "failed",
  );
  if (failedQuery) {
    return (
      <ErrorState
        message={failedQuery.error ?? "Could not load your projects."}
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
            description="Projects belong to a client."
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

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    const project = projectToDelete;

    setIsDeleting(true);
    const result = await dispatch(deleteProject(project.id));
    setIsDeleting(false);
    setProjectToDelete(null);

    if (deleteProject.fulfilled.match(result)) {
      dispatch(toastAdded(`${project.name} deleted`));
    } else {
      dispatch(
        toastAdded(result.payload ?? "Could not delete the project.", "error"),
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
        <Button onClick={() => setFormTarget("new")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="No projects yet"
            description="Create a project to track its budget and payments."
          />
          <div className="flex justify-center pb-4">
            <Button onClick={() => setFormTarget("new")}>
              Create your first project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              clientName={leadNameById.get(project.leadId) ?? "Unknown client"}
              balance={getProjectBalance(
                project,
                paymentsByProject.get(project.id) ?? [],
              )}
              today={today}
              onEdit={setFormTarget}
              onDelete={setProjectToDelete}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        target={formTarget}
        leads={leads}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={projectToDelete !== null}
        title="Delete this project?"
        message={`${projectToDelete?.name ?? "This project"} and all its payments will be permanently removed. This can't be undone.`}
        confirmLabel="Delete project"
        busy={isDeleting}
        busyLabel="Deleting…"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
