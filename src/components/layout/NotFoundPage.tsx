import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">404</h1>
      <p className="text-sm text-muted">This page doesn't exist.</p>
      <Link
        to="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Back home
      </Link>
    </main>
  );
}
