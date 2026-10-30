import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label: string;
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width]",
          value >= 100 ? "bg-success" : "bg-primary",
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
