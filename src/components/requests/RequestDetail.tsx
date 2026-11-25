import { Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { Request } from "@/lib/services/requests";
import { cn } from "@/lib/utils";
import { CategoryLabel } from "./CategoryLabel";
import { DeleteRequestButton } from "./DeleteRequestButton";
import { PriorityIndicator } from "./PriorityIndicator";
import { RelativeTime } from "./RelativeTime";
import { StatusSelect } from "./StatusSelect";
import { CATEGORY_TAB_CLASS } from "./styles";

/** Read-only view of one request, with its status still changeable in place. */
export function RequestDetail({ request }: { request: Request }) {
  const { id, title, description, category, priority, status, createdAt, updatedAt } = request;

  return (
    <article aria-labelledby="request-title" className="relative overflow-hidden rounded-xl border bg-card">
      {/* The department routing tab, as on the list row. */}
      <span aria-hidden="true" className={cn("absolute inset-y-0 start-0 w-1.5", CATEGORY_TAB_CLASS[category])} />

      <div className="flex flex-col gap-4 border-b p-5 ps-7 sm:flex-row sm:items-start sm:justify-between sm:p-7 sm:ps-9">
        <h1 id="request-title" className="text-2xl leading-tight font-extrabold [overflow-wrap:anywhere] sm:text-[1.95rem]">
          {title}
        </h1>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" size="lg" className="h-10 px-4">
            <Link href={`/requests/${id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
          <DeleteRequestButton requestId={id} requestTitle={title} trigger="button" redirectTo="/requests" />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-b p-5 ps-7 sm:grid-cols-3 sm:gap-x-6 sm:p-7 sm:ps-9 lg:grid-cols-5">
        <Detail term="Department">
          <CategoryLabel category={category} className="text-base" />
        </Detail>
        <Detail term="Priority">
          <PriorityIndicator priority={priority} className="text-base" />
        </Detail>
        {/* Full width on phones: "In Progress" plus the chevron outgrows half of 320px. */}
        <Detail term="Status" className="col-span-2 sm:col-span-1">
          <div className="-ms-1">
            <StatusSelect requestId={id} requestTitle={title} status={status} />
          </div>
        </Detail>
        <Detail term="Created">
          <Timestamp date={createdAt} />
        </Detail>
        <Detail term="Last updated">
          <Timestamp date={updatedAt} />
        </Detail>
      </dl>

      <section aria-labelledby="request-description" className="p-5 ps-7 sm:p-7 sm:ps-9">
        <h2 id="request-description" className="text-sm font-medium text-muted-foreground">
          Description
        </h2>
        {/* pre-wrap keeps the line breaks people typed into the textarea. */}
        <p className="mt-2 max-w-prose leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">{description}</p>
      </section>
    </article>
  );
}

function Detail({ term, className, children }: { term: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="flex min-h-8 items-center">{children}</dd>
    </div>
  );
}

/** The relative time people scan for, with the exact date underneath. */
function Timestamp({ date }: { date: Date }) {
  return (
    <span className="flex flex-col">
      <RelativeTime date={date} className="font-medium" />
      <span className="text-sm text-muted-foreground tabular-nums">{formatDateTime(date)}</span>
    </span>
  );
}
