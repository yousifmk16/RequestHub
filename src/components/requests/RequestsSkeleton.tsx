import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder with the real layout's shape, so nothing jumps when data lands. */
export function RequestsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading requests" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1fr)_repeat(4,10rem)]">
        <Skeleton className="col-span-2 h-10 lg:col-span-1" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <Skeleton className="mt-1 h-4 w-28" />
      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 py-4 ps-6 pe-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="hidden h-6 w-24 md:block" />
            <Skeleton className="hidden h-6 w-20 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
