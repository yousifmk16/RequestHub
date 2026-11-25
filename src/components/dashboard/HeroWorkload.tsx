import { connection } from "next/server";
import { WorkloadBars } from "@/components/brand/WorkloadBars";
import { getRequestStats } from "@/lib/services/requests";
import { describeWorkload, litBarCount } from "@/lib/workload";

/** The logo's workload meter at hero size, with its meaning spelled out. */
export async function HeroWorkload() {
  await connection(); // read at request time, not at build (see D4)
  const stats = await getRequestStats();
  const workload = { total: stats.total, completed: stats.byStatus.COMPLETED };

  return (
    <figure className="flex flex-col items-center gap-3">
      <WorkloadBars lit={litBarCount(workload)} animated className="size-56 lg:size-64" />
      <figcaption className="max-w-56 text-center text-sm text-on-navy-muted">
        {describeWorkload(workload)}
      </figcaption>
    </figure>
  );
}

/** Same footprint as the meter, so the hero doesn't shift while counts load. */
export function HeroWorkloadPlaceholder() {
  return <div aria-hidden="true" className="size-56 lg:size-64" />;
}
