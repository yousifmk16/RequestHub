import { describeWorkload, litBarCount, type Workload } from "@/lib/workload";
import { cn } from "@/lib/utils";
import { WorkloadBars } from "./WorkloadBars";

type WorkloadMarkProps = {
  /** Current totals; omit to show the full-colour brand mark (no data). */
  workload?: Workload;
  className?: string;
};

/** The logo tile: the workload bars on a navy square, with a tooltip. */
export function WorkloadMark({ workload, className }: WorkloadMarkProps) {
  const lit = workload ? litBarCount(workload) : 4;
  const description = workload ? describeWorkload(workload) : undefined;

  return (
    <span
      title={description}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-navy ring-1 ring-white/15",
        className,
      )}
    >
      <WorkloadBars lit={lit} className="size-full" />
      {description && <span className="sr-only">{description}</span>}
    </span>
  );
}
