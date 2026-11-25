import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Request } from "@/lib/services/requests";
import { cn } from "@/lib/utils";
import { CategoryLabel } from "./CategoryLabel";
import { DeleteRequestButton } from "./DeleteRequestButton";
import { PriorityIndicator } from "./PriorityIndicator";
import { RelativeTime } from "./RelativeTime";
import { StatusSelect } from "./StatusSelect";
import { CATEGORY_TAB_CLASS } from "./styles";

// One layout for every width: a column grid from md up, stacked rows below.
// Rendering each request once (not a table plus mobile cards) keeps a single
// status control and delete button per request.
const COLUMNS = "md:grid-cols-[minmax(0,1fr)_8.5rem_6.5rem_9.5rem_6.5rem_5.5rem]";

export function RequestList({ requests }: { requests: Request[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div
        aria-hidden="true"
        className={cn(
          "hidden gap-x-4 border-b bg-muted/60 py-3 ps-8 pe-4 text-xs font-medium text-muted-foreground md:grid",
          COLUMNS,
        )}
      >
        <span>Request</span>
        <span>Department</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Created</span>
        <span className="sr-only">Actions</span>
      </div>
      <ul aria-label="Requests" className="divide-y">
        {requests.map((request) => (
          <RequestRow key={request.id} request={request} />
        ))}
      </ul>
    </div>
  );
}

function RequestRow({ request }: { request: Request }) {
  const detailHref = `/requests/${request.id}`;
  const editHref = `${detailHref}/edit`;

  return (
    <li
      className={cn(
        // Phones: title | actions on the first row, meta underneath (no empty
        // actions line). From md up, COLUMNS takes over with one cell each.
        "relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-5 ps-8 pe-4 transition-colors hover:bg-muted/40 md:items-center",
        COLUMNS,
      )}
    >
      {/* The department routing tab. */}
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-4 start-3 w-1.5 rounded-full", CATEGORY_TAB_CLASS[request.category])}
      />

      <div className="min-w-0">
        <Link
          href={detailHref}
          title={request.title}
          className="line-clamp-2 text-[1.0625rem] leading-snug font-bold [overflow-wrap:anywhere] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {request.title}
        </Link>
        <p className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
          {request.description}
        </p>
      </div>

      {/* Stacked meta on mobile; becomes grid cells from md up. */}
      <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2 md:contents">
        <CategoryLabel category={request.category} />
        <PriorityIndicator priority={request.priority} />
        <StatusSelect requestId={request.id} requestTitle={request.title} status={request.status} />
        <RelativeTime date={request.createdAt} className="text-sm text-muted-foreground tabular-nums" />
      </div>

      {/* Placed top-right beside the title on phones, last column from md up. */}
      <div className="col-start-2 row-start-1 -me-2 -mt-1.5 flex items-start gap-0.5 md:col-auto md:row-auto md:me-0 md:mt-0 md:items-center md:justify-end">
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
          <Link href={editHref} aria-label={`Edit ${request.title}`}>
            <Pencil />
          </Link>
        </Button>
        <DeleteRequestButton requestId={request.id} requestTitle={request.title} />
      </div>
    </li>
  );
}
