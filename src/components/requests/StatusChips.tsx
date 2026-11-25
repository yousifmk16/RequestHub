"use client";

import { Layers } from "lucide-react";
import type { Status } from "@/generated/prisma/enums";
import { STATUS_LABELS, STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { STATUS_STYLE } from "./styles";

type StatusChipsProps = {
  value: Status | undefined;
  /** Counts under the other active filters (search, department, priority). */
  counts: Record<Status, number>;
  onChange: (status: Status | undefined) => void;
};

/**
 * One-tap status filter with live counts: "All 30 · New 9 · In Progress 7 ·
 * Completed 14". Counts ignore the status filter itself, so they stay put as
 * you switch between chips.
 */
export function StatusChips({ value, counts, onChange }: StatusChipsProps) {
  const total = STATUSES.reduce((sum, status) => sum + counts[status], 0);
  const chips = [
    { status: undefined, label: "All", count: total, Icon: Layers },
    ...STATUSES.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: counts[status],
      Icon: STATUS_STYLE[status].icon,
    })),
  ];

  return (
    <div
      role="group"
      aria-label="Filter by status"
      // Scrolls sideways on narrow phones rather than wrapping into two rows.
      // "relative" matters: the chips' sr-only text is position:absolute, and
      // without a positioned scroll container it escapes the clipping and
      // widens the whole page (found by the 320px reflow check).
      className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
    >
      {chips.map(({ status, label, count, Icon }) => {
        const active = status === value;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(status)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "border-brand-navy bg-brand-navy text-white"
                : "border-border bg-card text-foreground hover:border-brand-slate/40 hover:bg-secondary",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {/* The name is the visible text plus a hidden noun: "New 9 requests".
                Visible text must lead the name (WCAG 2.5.3 Label in Name). */}
            {label}{" "}
            <span
              className={cn(
                "min-w-6 rounded-full px-1.5 text-center text-xs tabular-nums",
                active ? "bg-white/15 text-white" : "bg-secondary text-muted-foreground",
              )}
            >
              {count}
            </span>
            <span className="sr-only"> {count === 1 ? "request" : "requests"}</span>
          </button>
        );
      })}
    </div>
  );
}
