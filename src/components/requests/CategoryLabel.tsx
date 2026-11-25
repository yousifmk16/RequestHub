import type { Category } from "@/generated/prisma/enums";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CATEGORY_TAB_CLASS } from "./styles";

/** Department name with a small routing-tab swatch, matching the row's edge. */
export function CategoryLabel({ category, className }: { category: Category; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span aria-hidden="true" className={cn("h-3 w-1 rounded-full", CATEGORY_TAB_CLASS[category])} />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
