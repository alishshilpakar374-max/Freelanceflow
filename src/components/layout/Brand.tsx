import { Rocket } from "lucide-react";

interface BrandProps {
  showText?: boolean;
}

export default function Brand({ showText = true }: BrandProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Rocket className="h-5 w-5" aria-hidden="true" />
      </div>
      {showText && (
        <span className="text-base font-semibold tracking-tight">
          FreelanceFlow
        </span>
      )}
    </div>
  );
}
