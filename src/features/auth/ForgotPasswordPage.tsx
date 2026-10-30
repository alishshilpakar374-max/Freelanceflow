import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/fieldStyles";
import AuthLayout from "@/features/auth/AuthLayout";
import { requestPasswordReset } from "@/features/auth/authApi";
import { forgotPasswordSchema } from "@/features/auth/authSchemas";
import type { ForgotPasswordFormValues } from "@/features/auth/authSchemas";

export default function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await requestPasswordReset(values.email);

    if (result.ok) setSentTo(values.email);
    else setFormError(result.message);
  });

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`If an account exists for ${sentTo}, we've sent a link to reset your password. The link expires, so use it soon.`}
      >
        <Link
          to="/login"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          to="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </p>
        )}

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

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
