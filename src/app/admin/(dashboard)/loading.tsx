import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the Business Hub segment — shown while server-rendered admin
 * pages fetch their data. Prevents a blank flash and reserves layout space.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
