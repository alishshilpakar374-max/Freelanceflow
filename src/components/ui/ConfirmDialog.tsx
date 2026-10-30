import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  busyLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  busyLabel = "Working…",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={busy}
          data-autofocus
        >
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? busyLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
