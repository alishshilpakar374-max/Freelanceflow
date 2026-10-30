import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/fieldStyles";
import type { AuthUser } from "@/features/auth/authSlice";
import { getErrorMessage } from "@/features/leads/leadsApi";
import { saveProfile } from "@/features/settings/personalDetails/profileApi";
import { profileFormSchema } from "@/features/settings/personalDetails/profileSchema";
import type { ProfileFormValues } from "@/features/settings/personalDetails/profileSchema";
import { useAppDispatch } from "@/hooks/redux";

import { UserRound, ShieldCheck } from "lucide-react";

interface ProfileCardProps {
  user: AuthUser;
  profile: ProfileFormValues;
}

export default function ProfileCard({ user, profile }: ProfileCardProps) {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await saveProfile(user.id, values, values.fullName !== user.fullName);
      reset(values); // marks the form as clean again
      dispatch(toastAdded("Profile updated"));
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not save your profile."));
    }
  });

  return (
    <Card className="flex flex-col gap-6 p-5 sm:p-7">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-border pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">
            Personal information
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Manage your personal and business details.
          </p>
        </div>
      </div>

      {/* Account information */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

        <div>
          <p className="text-sm font-medium">Account email</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Your email address is linked to your account and cannot be changed
            here.
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="grid max-w-3xl gap-x-5 gap-y-5 sm:grid-cols-2"
      >
        {submitError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-3 text-sm text-danger sm:col-span-2"
          >
            {submitError}
          </p>
        )}

        <div className="sm:col-span-2">
          <FormField label="Full name *" error={errors.fullName?.message}>
            {(control) => (
              <input
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                className={fieldClass}
                {...control}
                {...register("fullName")}
              />
            )}
          </FormField>
        </div>

        <FormField label="Email address">
          {(control) => (
            <input
              type="email"
              value={user.email}
              disabled
              className={`${fieldClass} cursor-not-allowed opacity-60`}
              {...control}
            />
          )}
        </FormField>

        <FormField label="Mobile number" error={errors.phone?.message}>
          {(control) => (
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+977 98XXXXXXXX"
              className={fieldClass}
              {...control}
              {...register("phone")}
            />
          )}
        </FormField>

        <FormField label="Business name" error={errors.businessName?.message}>
          {(control) => (
            <input
              type="text"
              autoComplete="organization"
              placeholder="Your business name"
              className={fieldClass}
              {...control}
              {...register("businessName")}
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

        <div className="sm:col-span-2">
          <FormField label="Location" error={errors.location?.message}>
            {(control) => (
              <input
                type="text"
                autoComplete="address-level2"
                placeholder="City, Country"
                className={fieldClass}
                {...control}
                {...register("location")}
              />
            )}
          </FormField>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Only your full name is required. Other details are optional.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
