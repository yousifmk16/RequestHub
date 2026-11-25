/**
 * The logo doubles as a workload meter: its four bars light up as requests get
 * completed. All four are lit when nothing is open (including when there are no
 * requests at all); none are lit when nothing has been completed yet.
 */
export const WORKLOAD_BAR_COUNT = 4;

export type Workload = {
  total: number;
  completed: number;
};

/** Number of lit bars: the completed share, rounded down to whole bars. */
export function litBarCount({ total, completed }: Workload): number {
  if (total <= 0) return WORKLOAD_BAR_COUNT;
  const completedShare = Math.min(Math.max(completed / total, 0), 1);
  return Math.floor(completedShare * WORKLOAD_BAR_COUNT);
}

/** Plain-language summary used for the logo's tooltip and accessible name. */
export function describeWorkload({ total, completed }: Workload): string {
  if (total === 0) return "No requests yet";
  const open = total - completed;
  if (open === 0) return `All ${total} requests completed`;
  return `${completed} of ${total} requests completed, ${open} open`;
}
