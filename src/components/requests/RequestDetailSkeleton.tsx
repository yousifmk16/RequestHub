import { Skeleton } from "@/components/ui/skeleton";

/** Same shape as RequestDetail, so nothing jumps when the request streams in. */
export function RequestDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading request" className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-4 border-b p-5 ps-7 sm:flex-row sm:justify-between sm:p-7 sm:ps-9">
        <Skeleton className="h-9 w-full max-w-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b p-5 ps-7 sm:grid-cols-3 sm:gap-x-6 sm:p-7 sm:ps-9 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          // The third cell (status) spans both columns on phones, as in RequestDetail.
          <div key={index} className={index === 2 ? "col-span-2 space-y-2 sm:col-span-1" : "space-y-2"}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
      <div className="space-y-2.5 p-5 ps-7 sm:p-7 sm:ps-9">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-4 w-2/3 max-w-prose" />
      </div>
    </div>
  );
}
