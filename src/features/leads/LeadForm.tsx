import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { fieldClass, textareaClass } from "@/components/ui/fieldStyles";
import {
  emptyLeadFormValues,
  formValuesToLeadInput,
  leadFormSchema,
  leadToFormValues,
} from "@/features/leads/leadSchema";
import type { LeadFormValues } from "@/features/leads/leadSchema";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "@/lib/constants";
import type { Lead, LeadInput } from "@/types";

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (input: LeadInput) => Promise<string | null>;
  onCancel: () => void;
}

export default function LeadForm({ lead, onSubmit, onCancel }: LeadFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: lead ? leadToFormValues(lead) : emptyLeadFormValues,
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const message = await onSubmit(formValuesToLeadInput(values));

      if (message) {
        setSubmitError(message);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="Business name *"
        error={errors.businessName?.message}
        className="sm:col-span-2"
      >
        {(control) => (
          <input
            type="text"
            autoComplete="organization"
            data-autofocus
            className={fieldClass}
            {...control}
            {...register("businessName")}
          />
        )}
      </FormField>

      <FormField label="Contact person" error={errors.contactName?.message}>
        {(control) => (
          <input
            type="text"
            autoComplete="name"
            className={fieldClass}
            {...control}
            {...register("contactName")}
          />
        )}
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        {(control) => (
          <input
            type="email"
            autoComplete="email"
            className={fieldClass}
            {...control}
            {...register("email")}
          />
        )}
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        {(control) => (
          <input
            type="tel"
            autoComplete="tel"
            className={fieldClass}
            {...control}
            {...register("phone")}
          />
        )}
      </FormField>

      <FormField label="Website" error={errors.website?.message}>
        {(control) => (
          <input
            type="text"
            inputMode="url"
            placeholder="example.com"
            className={fieldClass}
            {...control}
            {...register("website")}
          />
        )}
      </FormField>

      <FormField label="Source" error={errors.source?.message}>
        {(control) => (
          <select className={fieldClass} {...control} {...register("source")}>
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {LEAD_SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="Priority" error={errors.priority?.message}>
        {(control) => (
          <select className={fieldClass} {...control} {...register("priority")}>
            {LEAD_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {LEAD_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="Status" error={errors.status?.message}>
        {(control) => (
          <select className={fieldClass} {...control} {...register("status")}>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField
        label="Estimated deal value (USD)"
        error={errors.dealValue?.message}
      >
        {(control) => (
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            className={fieldClass}
            {...control}
            {...register("dealValue")}
          />
        )}
      </FormField>

      <FormField label="Next follow-up" error={errors.nextFollowUp?.message}>
        {(control) => (
          <input
            type="date"
            className={fieldClass}
            {...control}
            {...register("nextFollowUp")}
          />
        )}
      </FormField>

      <FormField
        label="Notes"
        error={errors.notes?.message}
        className="sm:col-span-2"
      >
        {(control) => (
          <textarea
            rows={4}
            className={textareaClass}
            {...control}
            {...register("notes")}
          />
        )}
      </FormField>

      {submitError && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {submitError}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : lead ? "Save changes" : "Add lead"}
        </Button>
      </div>
    </form>
  );
}
