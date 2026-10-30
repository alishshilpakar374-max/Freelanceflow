import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-7xl flex-col gap-6"
    >
      <span className="sr-only">Loading dashboard…</span>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-10 w-72 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={`stat-${index}`}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-20" />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={`panel-${index}`}>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-52 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
