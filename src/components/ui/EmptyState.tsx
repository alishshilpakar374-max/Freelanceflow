import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-sm text-muted">{description}</p>
    </div>
  );
}
