import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import { changePassword } from "@/features/auth/authApi";
import { changePasswordSchema } from "@/features/auth/authSchemas";
import type { ChangePasswordFormValues } from "@/features/auth/authSchemas";
import PasswordInput from "@/features/auth/PasswordInput";
import { useAppDispatch } from "@/hooks/redux";

import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface PasswordCardProps {
  email: string;
}

const emptyValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function PasswordCard({ email }: PasswordCardProps) {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const result = await changePassword(
      email,
      values.currentPassword,
      values.newPassword,
    );

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    reset(emptyValues);
    dispatch(toastAdded("Password changed. Other devices were signed out."));
  });

  return (
    <Card className="flex flex-col gap-6 p-5 sm:p-7">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-border pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LockKeyhole className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">
            Change password
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Keep your account secure by using a strong, unique password.
          </p>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex gap-3 rounded-xl border border-border bg-background p-3.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

        <div>
          <p className="text-sm font-medium">Account security</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            You'll stay signed in on this device. Other devices will be signed
            out.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex w-full max-w-lg flex-col gap-5"
      >
        {submitError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-3 text-sm text-danger"
          >
            {submitError}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <FormField
            label="Current password"
            error={errors.currentPassword?.message}
          >
            {(control) => (
              <PasswordInput
                {...control}
                autoComplete="current-password"
                registration={register("currentPassword")}
              />
            )}
          </FormField>

          <div className="border-t border-border" />

          <FormField label="New password" error={errors.newPassword?.message}>
            {(control) => (
              <PasswordInput
                {...control}
                autoComplete="new-password"
                registration={register("newPassword")}
              />
            )}
          </FormField>

          <FormField
            label="Confirm new password"
            error={errors.confirmPassword?.message}
          >
            {(control) => (
              <PasswordInput
                {...control}
                autoComplete="new-password"
                registration={register("confirmPassword")}
              />
            )}
          </FormField>
        </div>

        {/* Forgot password */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted">Forgot your current password?</p>

          <Link
            to="/forgot-password"
            className="font-medium text-primary transition-colors hover:underline"
          >
            Reset password
          </Link>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">Use at least 8 characters.</p>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
