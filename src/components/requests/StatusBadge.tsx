import type { Status } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { STATUS_STYLE } from "./styles";

/** Read-only status pill (the list uses StatusSelect to change it). */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { className: tone, icon: Icon } = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {STATUS_LABELS[status]}
    </span>
  );
}
