import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold tracking-tight">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          toneClasses[tone],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </Card>
  );
}
