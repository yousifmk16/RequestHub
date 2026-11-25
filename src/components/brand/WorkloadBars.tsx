import { WORKLOAD_BAR_COUNT } from "@/lib/workload";

/*
 * The Request Hub mark: four pill bars that lengthen top to bottom, each with a
 * white end dot, in Lakeora's red ramp (see --mark-bar-* in globals.css).
 * Bars light up from the bottom as the completed share grows; unlit bars are
 * grey. Shape and colours are a nod to Lakeora's mark, with four bars instead
 * of three so it reads as its own product.
 */
const BARS = [
  { colour: "var(--mark-bar-1)", length: 9 },
  { colour: "var(--mark-bar-2)", length: 13.5 },
  { colour: "var(--mark-bar-3)", length: 18 },
  { colour: "var(--mark-bar-4)", length: 22.5 },
] as const;

const BAR_HEIGHT = 4.4;
const BAR_GAP = 1.9;
const LEFT = 4.75;
// Centre the stack of bars vertically in the 32-unit viewBox.
const STACK_HEIGHT = BARS.length * BAR_HEIGHT + (BARS.length - 1) * BAR_GAP;
const TOP = (32 - STACK_HEIGHT) / 2;

type WorkloadBarsProps = {
  /** How many bars are lit, counted from the bottom (0 to 4). */
  lit: number;
  className?: string;
  /** Grow the bars in once on mount (the dashboard hero's one animation). */
  animated?: boolean;
};

export function WorkloadBars({ lit, className, animated = false }: WorkloadBarsProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      {BARS.map(({ colour, length }, index) => {
        const isLit = index >= WORKLOAD_BAR_COUNT - lit;
        const y = TOP + index * (BAR_HEIGHT + BAR_GAP);
        return (
          <g
            key={colour}
            className={animated ? "mark-bar-grow" : undefined}
            style={animated ? { animationDelay: `${(WORKLOAD_BAR_COUNT - 1 - index) * 90}ms` } : undefined}
          >
            <rect
              x={LEFT}
              y={y}
              width={length}
              height={BAR_HEIGHT}
              rx={BAR_HEIGHT / 2}
              fill={isLit ? colour : "var(--mark-unlit)"}
              className="transition-[fill] duration-500"
            />
            <circle
              cx={LEFT + length - BAR_HEIGHT / 2}
              cy={y + BAR_HEIGHT / 2}
              r={BAR_HEIGHT / 2 - 0.35}
              fill={isLit ? "var(--mark-dot)" : "var(--mark-dot-unlit)"}
              className="transition-[fill] duration-500"
            />
          </g>
        );
      })}
    </svg>
  );
}
