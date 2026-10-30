import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/fieldStyles";
import AuthLayout from "@/features/auth/AuthLayout";
import PasswordInput from "@/features/auth/PasswordInput";

import { signIn, signInWithGoogle } from "@/features/auth/authApi";
import { loginSchema } from "@/features/auth/authSchemas";
import type { LoginFormValues } from "@/features/auth/authSchemas";

export default function LoginPage() {
  const location = useLocation();

  const [formError, setFormError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsGoogleLoading(true);

    try {
      const { data, error } = await supabase.auth.getSession();

      console.log("BEFORE GOOGLE SESSION:", data.session);
      console.log("SESSION ERROR:", error);

      const result = await signInWithGoogle();

      if (!result.ok) {
        setFormError(result.message);
      }
    } catch {
      setFormError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      const result = await signIn(values.email, values.password);

      if (!result.ok) {
        setFormError(result.message);
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/signup"
            state={location.state}
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {/* Error message */}
        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
          >
            {formError}
          </div>
        )}

        {/* Email */}
        <FormField label="Email address" error={errors.email?.message}>
          {(control) => (
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`${fieldClass} h-12 rounded-xl px-4 transition-all duration-200 focus:ring-2 focus:ring-primary/15 focus:border-primary`}
              {...control}
              {...register("email")}
            />
          )}
        </FormField>

        {/* Password */}
        <FormField label="Password" error={errors.password?.message}>
          {(control) => (
            <PasswordInput
              {...control}
              autoComplete="current-password"
              registration={register("password")}
            />
          )}
        </FormField>

        {/* Forgot password */}
        <div className="-mt-2 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign in */}
        <Button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="h-12 w-full rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="h-px flex-1 bg-border" />
          <span className="px-4 text-[11px] font-semibold tracking-wider text-muted">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google sign in */}
        <button
          type="button"
          onClick={() => void handleGoogleSignIn()}
          disabled={isGoogleLoading || isSubmitting}
          className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-primary/40 hover:bg-background hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            viewBox="0 0 48 48"
            className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.73 7.18l7.28 5.65c4.25-3.92 7.49-9.7 7.49-17.3Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.96 23.96 0 0 0 0 21.56l7.98-6.19Z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.47 0 11.91-2.13 15.49-6.15l-7.28-5.65c-2.02 1.36-4.6 2.16-8.21 2.16-6.26 0-11.57-4.22-13.46-9.94l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>

          {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <p className="text-center text-xs leading-relaxed text-muted">
          Securely access your FreelanceFlow workspace.
        </p>
      </form>
    </AuthLayout>
  );
}
