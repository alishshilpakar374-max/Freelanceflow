import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
}

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

export default function FormField({
  label,
  error,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="text-[13px] font-semibold tracking-wide text-foreground"
      >
        {label}
      </label>

      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}

      {error && (
        <div
          id={errorId}
          role="alert"
          className="flex items-start gap-2 text-xs font-medium text-danger animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <span className="mt-px shrink-0" aria-hidden="true">
            !
          </span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
