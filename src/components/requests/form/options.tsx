import {
  CATEGORIES,
  CATEGORY_HINTS,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_HINTS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUSES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PriorityBars } from "../PriorityIndicator";
import { CATEGORY_TAB_CLASS, STATUS_STYLE } from "../styles";
import type { OptionCard } from "./OptionCards";

// The same visual language as the list: routing tab, signal bars, status icon.

export const CATEGORY_OPTIONS: OptionCard[] = CATEGORIES.map((category) => ({
  value: category,
  label: CATEGORY_LABELS[category],
  hint: CATEGORY_HINTS[category],
  adornment: (
    <span aria-hidden="true" className={cn("mt-0.5 h-8 w-1.5 shrink-0 rounded-full", CATEGORY_TAB_CLASS[category])} />
  ),
}));

export const PRIORITY_OPTIONS: OptionCard[] = PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_LABELS[priority],
  hint: PRIORITY_HINTS[priority],
  adornment: <PriorityBars priority={priority} className="mt-0.5" />,
}));

export const STATUS_OPTIONS: OptionCard[] = STATUSES.map((status) => {
  const { className, icon: Icon } = STATUS_STYLE[status];
  return {
    value: status,
    label: STATUS_LABELS[status],
    adornment: (
      <span aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full", className)}>
        <Icon className="size-3.5" />
      </span>
    ),
  };
});
