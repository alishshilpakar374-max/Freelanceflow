import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/fieldStyles";
import Modal from "@/components/ui/Modal";
import { followUpFormSchema } from "@/features/follow-ups/followUpSchema";
import type { FollowUpFormValues } from "@/features/follow-ups/followUpSchema";
import { createFollowUp } from "@/features/follow-ups/followUpsSlice";
import { useAppDispatch } from "@/hooks/redux";
import { todayISO } from "@/lib/dates";
import type { Lead } from "@/types";

interface FollowUpFormProps {
  leads: Lead[];
  onClose: () => void;
}

function FollowUpForm({ leads, onClose }: FollowUpFormProps) {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: { leadId: "", title: "", dueDate: todayISO() },
  });

  const sortedLeads = [...leads].sort((a, b) =>
    a.businessName.localeCompare(b.businessName),
  );

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    const result = await dispatch(createFollowUp(values));

    if (createFollowUp.fulfilled.match(result)) {
      dispatch(toastAdded("Follow-up added"));
      onClose();
    } else {
      setSubmitError(result.payload ?? "Could not add the follow-up.");
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {submitError}
        </p>
      )}

      <FormField label="Lead *" error={errors.leadId?.message}>
        {(control) => (
          <select
            data-autofocus
            className={fieldClass}
            {...control}
            {...register("leadId")}
          >
            <option value="">Choose a lead…</option>
            {sortedLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.businessName}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="What needs to happen? *" error={errors.title?.message}>
        {(control) => (
          <input
            type="text"
            placeholder="e.g. Ask about proposal feedback"
            className={fieldClass}
            {...control}
            {...register("title")}
          />
        )}
      </FormField>

      <FormField label="Due date *" error={errors.dueDate?.message}>
        {(control) => (
          <input
            type="date"
            className={fieldClass}
            {...control}
            {...register("dueDate")}
          />
        )}
      </FormField>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add follow-up"}
        </Button>
      </div>
    </form>
  );
}

interface FollowUpFormModalProps {
  open: boolean;
  leads: Lead[];
  onClose: () => void;
}

export default function FollowUpFormModal({
  open,
  leads,
  onClose,
}: FollowUpFormModalProps) {
  return (
    <Modal open={open} title="Add follow-up" onClose={onClose}>
      <FollowUpForm leads={leads} onClose={onClose} />
    </Modal>
  );
}
