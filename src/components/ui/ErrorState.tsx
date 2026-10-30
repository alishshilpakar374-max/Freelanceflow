import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Card role="alert" className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-danger/15 text-danger">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </Card>
  );
}
