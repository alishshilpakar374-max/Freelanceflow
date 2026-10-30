import { CalendarPlus, FolderPlus, Sparkles, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  to: string;
  icon: LucideIcon;
}

const actions: QuickAction[] = [
  { label: "Add lead", to: "/leads", icon: UserPlus },
  { label: "New project", to: "/projects", icon: FolderPlus },
  { label: "Log follow-up", to: "/follow-ups", icon: CalendarPlus },
  { label: "Write outreach", to: "/ai-outreach", icon: Sparkles },
];

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ label, to, icon: Icon }, index) => (
        <Link
          key={to}
          to={to}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
            index === 0
              ? "bg-primary text-primary-foreground hover:bg-primary-hover"
              : "border border-border bg-surface text-foreground hover:bg-surface-muted",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </div>
  );
}
