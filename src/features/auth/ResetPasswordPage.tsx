import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import FullPageSpinner from "@/components/ui/FullPageSpinner";
import AuthLayout from "@/features/auth/AuthLayout";
import { updatePassword } from "@/features/auth/authApi";
import { resetPasswordSchema } from "@/features/auth/authSchemas";
import type { ResetPasswordFormValues } from "@/features/auth/authSchemas";
import PasswordInput from "@/features/auth/PasswordInput";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await updatePassword(values.password);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    dispatch(toastAdded("Password updated"));
    navigate("/", { replace: true });
  });

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a password you haven't used before."
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

        <FormField
          label="New password (8+ characters)"
          error={errors.password?.message}
        >
          {(control) => (
            <PasswordInput
              {...control}
              autoComplete="new-password"
              registration={register("password")}
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

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  const status = useAppSelector((state) => state.auth.status);

  if (status === "loading") return <FullPageSpinner />;

  // The emailed link signs you in temporarily. No session means the link is invalid or expired.
  if (status === "unauthenticated") {
    return (
      <AuthLayout
        title="Link invalid or expired"
        subtitle="This password reset link can't be used anymore. Request a new one."
      >
        <Link
          to="/forgot-password"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Send a new link
        </Link>
      </AuthLayout>
    );
  }

  return <ResetPasswordForm />;
}
