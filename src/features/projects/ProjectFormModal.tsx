import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/fieldStyles";
import Modal from "@/components/ui/Modal";
import {
  emptyProjectFormValues,
  formValuesToProjectInput,
  projectFormSchema,
  projectToFormValues,
} from "@/features/projects/projectSchema";
import type { ProjectFormValues } from "@/features/projects/projectSchema";
import {
  createProject,
  updateProject,
} from "@/features/projects/projectsSlice";
import { useAppDispatch } from "@/hooks/redux";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants";
import type { Lead, Project } from "@/types";

interface ProjectFormProps {
  project?: Project;
  leads: Lead[];
  onClose: () => void;
}

function ProjectForm({ project, leads, onClose }: ProjectFormProps) {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? projectToFormValues(project)
      : emptyProjectFormValues,
  });

  const sortedLeads = leads
    .filter((lead) => lead.status === "won")
    .sort((a, b) => a.businessName.localeCompare(b.businessName));

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    const input = formValuesToProjectInput(values);

    if (project) {
      const result = await dispatch(
        updateProject({ id: project.id, changes: input }),
      );
      if (!updateProject.fulfilled.match(result)) {
        setSubmitError(result.payload ?? "Could not save your changes.");
        return;
      }
      dispatch(toastAdded(`${input.name} updated`));
    } else {
      const result = await dispatch(createProject(input));
      if (!createProject.fulfilled.match(result)) {
        setSubmitError(result.payload ?? "Could not create the project.");
        return;
      }
      dispatch(toastAdded(`${input.name} created`));
    }

    onClose();
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger sm:col-span-2"
        >
          {submitError}
        </p>
      )}

      <FormField
        label="Project name *"
        error={errors.name?.message}
        className="sm:col-span-2"
      >
        {(control) => (
          <input
            type="text"
            data-autofocus
            className={fieldClass}
            {...control}
            {...register("name")}
          />
        )}
      </FormField>

      <FormField label="Client *" error={errors.leadId?.message}>
        {(control) => (
          <select className={fieldClass} {...control} {...register("leadId")}>
            <option value="">Choose a client…</option>
            {sortedLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.businessName}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="Budget (USD) *" error={errors.budget?.message}>
        {(control) => (
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            className={fieldClass}
            {...control}
            {...register("budget")}
          />
        )}
      </FormField>

      <FormField label="Status" error={errors.status?.message}>
        {(control) => (
          <select className={fieldClass} {...control} {...register("status")}>
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="hidden sm:block" aria-hidden="true" />

      <FormField label="Start date" error={errors.startDate?.message}>
        {(control) => (
          <input
            type="date"
            className={fieldClass}
            {...control}
            {...register("startDate")}
          />
        )}
      </FormField>

      <FormField label="Deadline" error={errors.deadline?.message}>
        {(control) => (
          <input
            type="date"
            className={fieldClass}
            {...control}
            {...register("deadline")}
          />
        )}
      </FormField>

      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : project
              ? "Save changes"
              : "Create project"}
        </Button>
      </div>
    </form>
  );
}

interface ProjectFormModalProps {
  // null = closed, 'new' = creating, a Project = editing it
  target: Project | "new" | null;
  leads: Lead[];
  onClose: () => void;
}

export default function ProjectFormModal({
  target,
  leads,
  onClose,
}: ProjectFormModalProps) {
  const project = target !== null && target !== "new" ? target : undefined;

  return (
    <Modal
      open={target !== null}
      title={project ? "Edit project" : "New project"}
      onClose={onClose}
    >
      <ProjectForm project={project} leads={leads} onClose={onClose} />
    </Modal>
  );
}
