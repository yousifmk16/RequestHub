import type { Priority } from "@/generated/prisma/enums";
import { PRIORITY_LABELS, PRIORITY_WEIGHT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BAR_HEIGHTS = ["h-1.5", "h-2.5", "h-3.5"] as const;

/** Signal bars (1-3 filled) for a priority. Decorative: always pair with the word. */
export function PriorityBars({ priority, className }: { priority: Priority; className?: string }) {
  const filled = PRIORITY_WEIGHT[priority];
  const isHigh = priority === "HIGH";

  return (
    <span aria-hidden="true" className={cn("flex h-3.5 items-end gap-0.5", className)}>
      {BAR_HEIGHTS.map((height, index) => (
        <span
          key={height}
          className={cn(
            "w-1 rounded-sm",
            height,
            index < filled ? (isHigh ? "bg-priority-high" : "bg-brand-slate") : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

/** Signal bars plus the word, so urgency reads without relying on colour. */
export function PriorityIndicator({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        priority === "HIGH" ? "font-medium text-priority-high" : "text-foreground",
        className,
      )}
    >
      <PriorityBars priority={priority} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
