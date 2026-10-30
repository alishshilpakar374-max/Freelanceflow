import { useEffect } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { toastDismissed } from "@/components/layout/toastSlice";
import type { Toast } from "@/components/layout/toastSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = window.setTimeout(
      () => dispatch(toastDismissed(toast.id)),
      4000,
    );
    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id]);

  const Icon = toast.tone === "success" ? CheckCircle2 : XCircle;

  return (
    <div className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg">
      <Icon
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          toast.tone === "success" ? "text-success" : "text-danger",
        )}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        type="button"
        onClick={() => dispatch(toastDismissed(toast.id))}
        aria-label="Dismiss notification"
        className="text-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function ToastViewport() {
  const toasts = useAppSelector((state) => state.toast.items);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
