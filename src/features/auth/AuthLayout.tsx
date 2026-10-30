import type { ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";

import Brand from "@/components/layout/Brand";
import Card from "@/components/ui/Card";
import ThemeToggle from "@/features/settings/theme/ThemeToggle";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
}

const features = [
  "Manage clients and projects",
  "Track payments and revenue",
  "Keep your freelance work organized",
];

const highlights = [
  { label: "Clients", value: "Organized" },
  { label: "Projects", value: "On track" },
  { label: "Payments", value: "Monitored" },
];

export default function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8 lg:px-12">
        <Brand />
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-12">
        {/* Left section */}
        <section className="hidden lg:block">
          <div className="mx-auto max-w-lg">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Your freelance workspace
              </span>
            </div>

            <div className="text-center">
              <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
                Your work.
                <br />
                <span className="text-primary">All in one place.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted">
                Spend less time managing your freelance business and more time
                doing the work that matters.
              </p>
            </div>

            {/* Minimal workspace preview */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">Your workspace</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Everything in one place
                  </p>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="px-3 py-5 text-center sm:px-5"
                  >
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-5 py-4">
                <p className="mb-4 text-xs font-semibold text-muted">
                  BUILT FOR YOUR WORKFLOW
                </p>

                <div className="space-y-3">
                  {features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted">
              A simpler way to run your freelance business.
            </p>
          </div>
        </section>

        {/* Right section */}
        <section className="flex w-full items-center justify-center">
          <div className="w-full max-w-105">
            {/* Mobile heading */}
            <div className="mb-7 lg:hidden">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                FreelanceFlow
              </p>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
            </div>

            <Card className="relative overflow-hidden border border-border bg-surface p-6 shadow-sm sm:p-8">
              {/* Desktop heading */}
              <div className="mb-7 hidden lg:block">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {title}
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
              </div>

              {children}
            </Card>

            {footer && (
              <p className="mt-6 text-center text-sm text-muted">{footer}</p>
            )}

            <p className="mt-8 text-center text-xs text-muted/70">
              By continuing, you agree to use FreelanceFlow responsibly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 px-5 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} FreelanceFlow. All rights reserved.
      </footer>
    </div>
  );
}
