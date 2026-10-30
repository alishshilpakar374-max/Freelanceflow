import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { passwordFieldClass } from "@/components/ui/fieldStyles";

interface PasswordInputProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  autoComplete: "current-password" | "new-password";
  registration: UseFormRegisterReturn;
}

export default function PasswordInput({
  registration,
  autoComplete,
  ...control
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className={passwordFieldClass}
        {...control}
        {...registration}
      />
      <button
        type="button"
        onClick={() => setVisible((previous) => !previous)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-foreground"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
