import type { Priority } from "@/generated/prisma/enums";
import { PriorityBars } from "@/components/requests/PriorityIndicator";
import { CATEGORY_TAB_CLASS } from "@/components/requests/styles";
import { CATEGORIES, CATEGORY_LABELS, PRIORITIES, PRIORITY_LABELS } from "@/lib/constants";
import { buildRequestsHref } from "@/lib/request-query-url";
import type { RequestStats } from "@/lib/services/requests";
import { cn } from "@/lib/utils";
import { BreakdownBars } from "./BreakdownBars";

// Low and medium in quiet tones; high in the alert red used across the app.
const PRIORITY_BAR_CLASS: Record<Priority, string> = {
  LOW: "bg-category-other",
  MEDIUM: "bg-brand-slate",
  HIGH: "bg-priority-high",
};

/** R7 breakdowns by department and by priority. */
export function Breakdowns({ stats }: { stats: RequestStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BreakdownBars
        id="by-department"
        title="By department"
        description="Which team the requests are for."
        total={stats.total}
        rows={CATEGORIES.map((category) => ({
          key: category,
          label: CATEGORY_LABELS[category],
          value: stats.byCategory[category],
          href: buildRequestsHref({ category }),
          barClass: CATEGORY_TAB_CLASS[category],
          adornment: (
            <span aria-hidden="true" className={cn("h-4 w-1 shrink-0 rounded-full", CATEGORY_TAB_CLASS[category])} />
          ),
        }))}
      />
      <BreakdownBars
        id="by-priority"
        title="By priority"
        description="How urgent the requests are."
        total={stats.total}
        rows={PRIORITIES.toReversed().map((priority) => ({
          key: priority,
          label: PRIORITY_LABELS[priority],
          value: stats.byPriority[priority],
          href: buildRequestsHref({ priority }),
          barClass: PRIORITY_BAR_CLASS[priority],
          adornment: <PriorityBars priority={priority} />,
        }))}
      />
    </div>
  );
}
