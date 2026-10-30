import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Sync the `open` prop with the native dialog API.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Any element marked data-autofocus gets focus first (otherwise the browser picks the first control).
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose} // fires on Escape and on dialog.close()
      onClick={(event) => {
        // A click directly on the <dialog> element is a click on the backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
      className="no-scroll-y m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-slate-950/50"
    >
      {/* Children only exist while open, so every open starts with a fresh form. */}
      {open && (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-2 -mt-2"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
