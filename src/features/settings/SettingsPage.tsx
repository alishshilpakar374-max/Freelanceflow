import { useSearchParams } from "react-router-dom";
import { User, LockKeyhole, Palette, ArrowLeft } from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";

import type { AuthUser } from "@/features/auth/authSlice";
import PasswordCard from "@/features/settings/password/PasswordCard";
import ProfileCard from "@/features/settings/personalDetails/ProfileCard";
import ThemeSetting from "@/features/settings/theme/ThemeSetting";
import { useProfile } from "@/features/settings/personalDetails/useProfile";
import { useAppSelector } from "@/hooks/redux";

type SettingsSection = "profile" | "password" | "theme";

const validSections: SettingsSection[] = ["profile", "password", "theme"];

function SettingsContent({ user }: { user: AuthUser }) {
  const [searchParams, setSearchParams] = useSearchParams();

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
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium">{section.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {section.description}
                    </p>
                  </div>

                  <span className="text-lg text-muted transition group-hover:translate-x-1 group-hover:text-primary">
                    →
                  </span>
                </button>
              );
            })}
          </div>
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
    </div>
  );
}

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return <SettingsContent user={user} />;
}
