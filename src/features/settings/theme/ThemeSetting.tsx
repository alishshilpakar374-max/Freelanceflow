import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import { setTheme } from "@/features/settings/theme/themeSlice";
import type { ThemeMode } from "@/features/settings/theme/themeSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";

const options: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: "light",
    label: "Light",
    description: "Always use the light theme",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use the dark theme",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Match your device setting",
    icon: Monitor,
  },
];

export default function ThemeSetting() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <Card>
      <h2 className="text-base font-semibold">Appearance</h2>
      <p className="text-sm text-muted">
        Choose how FreelanceFlow looks. Saved on this device.
      </p>

      <div
        role="group"
        aria-label="Theme preference"
        className="mt-4 grid gap-3 sm:grid-cols-3"
      >
        {options.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => dispatch(setTheme(value))}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              mode === value
                ? "border-primary bg-primary/10"
                : "border-border bg-surface hover:bg-surface-muted",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                mode === value ? "text-primary" : "text-muted",
              )}
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="block text-xs text-muted">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
