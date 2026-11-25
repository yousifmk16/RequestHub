import { connection } from "next/server";
import { getRequestStats } from "@/lib/services/requests";
import type { Workload } from "@/lib/workload";
import { WorkloadMark } from "./WorkloadMark";

/**
 * The header logo, showing live progress. It re-renders with the layout on
 * every router.refresh(), so completing a request lights up the bars.
 */
export async function LiveWorkloadMark() {
  // Local SQLite answers so fast that Next would bake the counts into the
  // build. connection() makes this read happen per request (docs/decisions.md
  // D4). It must stay outside the try/catch below: during prerendering it
  // signals Next by throwing, and catching that would freeze the fallback.
  await connection();
  return <WorkloadMark workload={await loadWorkload()} />;
}

// The logo must never take the header down: if the counts can't be read, it
// falls back to the plain full-colour mark (workload undefined).
async function loadWorkload(): Promise<Workload | undefined> {
  try {
    const stats = await getRequestStats();
    return { total: stats.total, completed: stats.byStatus.COMPLETED };
  } catch (error) {
    console.error("Could not load workload for the logo", error);
    return undefined;
  }
}
