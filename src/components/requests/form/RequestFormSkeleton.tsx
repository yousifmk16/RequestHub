import { Skeleton } from "@/components/ui/skeleton";

export function RequestFormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading request" className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <div className="space-y-7 rounded-xl border bg-card p-5 sm:p-7">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-36 w-full" />
        <div className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}
