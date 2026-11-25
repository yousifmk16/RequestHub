import { cn } from "@/lib/utils";

/*
 * The Request Hub mark: one bar per department, rising left to right like a
 * queue being worked through. Bars use the department colours, lightened where
 * needed to stay visible on navy (see --mark-* in globals.css).
 */
const BARS = [
  { colour: "var(--mark-it)", height: 7 },
  { colour: "var(--mark-hr)", height: 10.5 },
  { colour: "var(--mark-administration)", height: 14 },
  { colour: "var(--mark-other)", height: 17.5 },
] as const;

const BASELINE = 20.5;

/** The bars alone. Scales to any size; `animated` grows them once on load. */
export function RoutingBars({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {BARS.map(({ colour, height }, index) => (
        <rect
          key={colour}
          x={3.5 + index * 4.5}
          y={BASELINE - height}
          width="3.5"
          height={height}
          rx="1"
          fill={colour}
          className={animated ? "routing-bar-grow" : undefined}
          style={animated ? { animationDelay: `${index * 90}ms` } : undefined}
        />
      ))}
    </svg>
  );
}

/** The app icon: the bars on a navy tile, as in the favicon. */
export function RoutingMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg bg-brand-navy", className)}>
      <RoutingBars className="size-[78%]" />
    </span>
  );
}
