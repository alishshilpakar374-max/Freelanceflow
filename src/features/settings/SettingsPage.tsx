import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  User,
  LockKeyhole,
  Palette,
  ArrowLeft,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";

import type { AuthUser } from "@/features/auth/authSlice";
import PasswordCard from "@/features/settings/password/PasswordCard";
import ProfileCard from "@/features/settings/personalDetails/ProfileCard";
import ThemeSetting from "@/features/settings/theme/ThemeSetting";
import { useProfile } from "@/features/settings/personalDetails/useProfile";
import { signOut } from "@/features/auth/authApi";
import { toastAdded } from "@/components/layout/toastSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

type SettingsSection = "profile" | "password" | "theme";

const validSections: SettingsSection[] = ["profile", "password", "theme"];

function SettingsContent({ user }: { user: AuthUser }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const sectionParam = searchParams.get("section");

  const activeSection: SettingsSection | null = validSections.includes(
    sectionParam as SettingsSection,
  )
    ? (sectionParam as SettingsSection)
    : null;

  const { state, reload } = useProfile(user.id);

  const sections = [
    {
      id: "profile" as const,
      title: "Profile",
      description: "Manage your personal and business information.",
      icon: User,
    },
    {
      id: "password" as const,
      title: "Change Password",
      description: "Update your account password.",
      icon: LockKeyhole,
    },
    {
      id: "theme" as const,
      title: "Theme",
      description: "Customize your application appearance.",
      icon: Palette,
    },
  ];

  const setActiveSection = (section: SettingsSection | null) => {
    if (section) {
      setSearchParams({ section });
    } else {
      setSearchParams({});
    }
  };

  const goBack = () => setActiveSection(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const result = await signOut();

      if (!result.ok) {
        dispatch(toastAdded(result.message, "error"));
        setIsSigningOut(false);
      }
    } catch {
      dispatch(toastAdded("Could not sign out. Please try again.", "error"));
      setIsSigningOut(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {!activeSection ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-muted">
              Manage your account preferences and settings.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-primary/50 hover:bg-surface/80"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium group-hover:text-primary">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {section.description}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              );
            })}
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            className="group flex w-full items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left transition hover:border-red-500/40 hover:bg-red-500/10"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-colors group-hover:bg-red-500 group-hover:text-white">
              <LogOut className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-red-500">Sign Out</h2>
              <p className="mt-1 text-sm text-muted">
                Sign out of your FreelanceFlow account.
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-red-500/60 transition group-hover:translate-x-1" />
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={goBack}
              aria-label="Back to settings"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="text-xl font-semibold">
                {
                  sections.find((section) => section.id === activeSection)
                    ?.title
                }
              </h1>

              <p className="text-sm text-muted">
                Manage your{" "}
                {activeSection === "password"
                  ? "account security"
                  : activeSection === "profile"
                    ? "profile information"
                    : "appearance preferences"}
                .
              </p>
            </div>
          </div>

          {activeSection === "profile" && (
            <>
              {state.status === "loading" && (
                <Card
                  role="status"
                  aria-live="polite"
                  className="flex flex-col gap-3"
                >
                  <span className="sr-only">Loading profile…</span>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              )}

              {state.status === "failed" && (
                <ErrorState message={state.error} onRetry={reload} />
              )}

              {state.status === "ready" && (
                <ProfileCard
                  user={user}
                  profile={
                    state.profile ?? {
                      fullName: user.fullName,
                      phone: "",
                      businessName: "",
                      website: "",
                      location: "",
                    }
                  }
                />
              )}
            </>
          )}

          {activeSection === "password" && <PasswordCard email={user.email} />}

          {activeSection === "theme" && <ThemeSetting />}
        </>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isSigningOut) setShowSignOutConfirm(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="signout-title"
            aria-describedby="signout-description"
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSignOutConfirm(false)}
              disabled={isSigningOut}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <LogOut className="h-6 w-6" />
            </div>

            <h2 id="signout-title" className="text-lg font-semibold">
              Sign out?
            </h2>

            <p
              id="signout-description"
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              Are you sure you want to sign out of your FreelanceFlow account?
              You'll need to log in again to access your account.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? "Signing out..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return <SettingsContent user={user} />;
}
