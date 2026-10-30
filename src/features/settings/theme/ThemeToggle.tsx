import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { setTheme } from "@/features/settings/theme/themeSlice";
import type { ThemeMode } from "@/features/settings/theme/themeSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";

const options: Array<{ value: ThemeMode; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-lg border border-border bg-surface-muted p-1"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => dispatch(setTheme(value))}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            mode === value
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
