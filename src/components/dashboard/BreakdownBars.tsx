import Link from "next/link";
import type { ReactNode } from "react";
import { percentOf } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BreakdownRow = {
  key: string;
  label: string;
  value: number;
  href: string;
  barClass: string;
  adornment?: ReactNode;
};

type BreakdownBarsProps = {
  id: string;
  title: string;
  description: string;
  rows: BreakdownRow[];
  total: number;
};

/**
 * A horizontal bar chart drawn in HTML (see docs/decisions.md D12). Every row is
 * a link to the matching filtered list, so the chart is keyboard- and
 * screen-reader friendly without a separate data table.
 */
export function BreakdownBars({ id, title, description, rows, total }: BreakdownBarsProps) {
  // Bars are scaled to the largest row so small differences stay visible;
  // the percentage beside each bar is the share of all requests.
  const largest = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section aria-labelledby={id} className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 id={id} className="text-lg">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>

      {total === 0 ? (
        <p className="mt-6 rounded-lg bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing to show yet. Bars appear as requests come in.
        </p>
      ) : (
        <ul className="mt-5 space-y-1">
          {rows.map((row) => {
            const share = percentOf(row.value, total);
            return (
              <li key={row.key}>
                <Link
                  href={row.href}
                  className="-mx-2 grid grid-cols-[7.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring sm:grid-cols-[9rem_minmax(0,1fr)_5rem]"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                    {row.adornment}
                    <span className="truncate">{row.label}</span>
                  </span>
                  <span aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-secondary">
                    <span
                      className={cn("block h-full rounded-full", row.barClass)}
                      style={{ width: `${(row.value / largest) * 100}%` }}
                    />
                  </span>
                  <span className="text-end text-sm tabular-nums">
                    {/* A real space, not just margin: otherwise "1" and "100%" are read as "1100%". */}
                    <span className="font-bold">{row.value}</span>{" "}
                    <span className="text-muted-foreground">{share}%</span>
                    {/* Read as "HR 8 27% of all requests": visible text first (WCAG 2.5.3). */}
                    <span className="sr-only"> of all requests</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
