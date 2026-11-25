import { Layers, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { STATUS_STYLE } from "@/components/requests/styles";
import { STATUS_LABELS, STATUSES } from "@/lib/constants";
import { percentOf } from "@/lib/format";
import { buildRequestsHref } from "@/lib/request-query-url";
import type { RequestStats } from "@/lib/services/requests";
import { cn } from "@/lib/utils";

type StatCard = {
  label: string;
  value: number;
  context: string;
  href: string;
  icon: LucideIcon;
  iconClass: string;
};

/** R7 totals. Each card opens the list filtered to what it counts. */
export function StatCards({ stats }: { stats: RequestStats }) {
  const open = stats.byStatus.NEW + stats.byStatus.IN_PROGRESS;
  const cards: StatCard[] = [
    {
      label: "All requests",
      value: stats.total,
      context: stats.total === 0 ? "Nothing submitted yet" : `${open} still open`,
      href: buildRequestsHref({}),
      icon: Layers,
      iconClass: "bg-brand-navy text-white",
    },
    ...STATUSES.map((status) => ({
      label: STATUS_LABELS[status],
      value: stats.byStatus[status],
      context: `${percentOf(stats.byStatus[status], stats.total)}% of all requests`,
      href: buildRequestsHref({ status }),
      icon: STATUS_STYLE[status].icon,
      iconClass: STATUS_STYLE[status].className,
    })),
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, context, href, icon: Icon, iconClass }) => (
        <li key={label}>
          <Link
            href={href}
            className="group flex h-full flex-col rounded-xl border bg-card p-4 transition-colors hover:border-brand-slate/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-5"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{label}</span>
              <span aria-hidden="true" className={cn("grid size-8 place-items-center rounded-full", iconClass)}>
                <Icon className="size-4" />
              </span>
            </span>
            <span className="mt-3 text-3xl font-extrabold tabular-nums sm:text-4xl">{value}</span>
            <span className="mt-1 text-xs text-muted-foreground sm:text-sm">{context}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
