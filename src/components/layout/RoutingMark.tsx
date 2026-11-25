import { cn } from "@/lib/utils";

/**
 * The Request Hub mark: four routing tabs in the department colours, the same
 * bars that tag every request (see docs/design.md).
 */
export function RoutingMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("size-5", className)}>
      <rect x="1" y="2" width="3.5" height="16" rx="1" fill="var(--category-it)" />
      <rect x="5.75" y="2" width="3.5" height="16" rx="1" fill="var(--category-hr)" />
      <rect x="10.5" y="2" width="3.5" height="16" rx="1" fill="var(--category-administration)" />
      <rect x="15.25" y="2" width="3.5" height="16" rx="1" fill="var(--category-other)" />
    </svg>
  );
}
