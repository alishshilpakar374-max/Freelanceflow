import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/fieldStyles";
import {
  paymentFormSchema,
  parsePaymentAmount,
} from "@/features/projects/paymentSchema";
import type { PaymentFormValues } from "@/features/projects/paymentSchema";
import { createPayment } from "@/features/projects/projectsSlice";
import { useAppDispatch } from "@/hooks/redux";
import { todayISO } from "@/lib/dates";

interface PaymentFormProps {
  projectId: string;
}

export default function PaymentForm({ projectId }: PaymentFormProps) {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { amount: "", paidOn: todayISO(), note: "" },
  });

  const submit = handleSubmit(async (values) => {
    const result = await dispatch(
      createPayment({
        projectId,
        amount: parsePaymentAmount(values.amount),
        paidOn: values.paidOn,
        note: values.note,
      }),
    );

    if (createPayment.fulfilled.match(result)) {
      reset({ amount: "", paidOn: values.paidOn, note: "" });
      dispatch(toastAdded("Payment recorded"));
    } else {
      dispatch(
        toastAdded(result.payload ?? "Could not record the payment.", "error"),
      );
    }
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
      <FormField label="Amount (USD)" error={errors.amount?.message}>
        {(control) => (
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            className={fieldClass}
            {...control}
            {...register("amount")}
          />
        )}
      </FormField>

      <FormField label="Date received" error={errors.paidOn?.message}>
        {(control) => (
          <input
            type="date"
            className={fieldClass}
            {...control}
            {...register("paidOn")}
          />
        )}
      </FormField>

      <FormField
        label="Note (optional)"
        error={errors.note?.message}
        className="sm:col-span-2"
      >
        {(control) => (
          <input
            type="text"
            placeholder="e.g. First milestone"
            className={fieldClass}
            {...control}
            {...register("note")}
          />
        )}
      </FormField>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording…" : "Record payment"}
        </Button>
      </div>
    </form>
  );
}
