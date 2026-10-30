import { Loader2 } from "lucide-react";

export default function FullPageSpinner() {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
