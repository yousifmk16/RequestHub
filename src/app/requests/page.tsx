import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestFilters } from "@/components/requests/RequestFilters";
import { RequestList } from "@/components/requests/RequestList";
import { NoMatchingRequests, NoRequestsYet } from "@/components/requests/RequestsEmptyState";
import { RequestsSkeleton } from "@/components/requests/RequestsSkeleton";
import { buildRequestsHref, hasActiveFilters } from "@/lib/request-query-url";
import { listRequests } from "@/lib/services/requests";
import { parseRequestQuery } from "@/lib/validation";

export const metadata: Metadata = { title: "Requests" };

export default function RequestsPage({ searchParams }: PageProps<"/requests">) {
  return (
    <PageContainer>
      <PageHeader title="Requests" description="Search, filter and update every request in one place." />
      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsResults searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}

// UI -> URL params -> Zod (tolerant parse) -> service -> Prisma.
async function RequestsResults({ searchParams }: Pick<PageProps<"/requests">, "searchParams">) {
  await connection(); // always read at request time (docs/decisions.md D4)
  const query = parseRequestQuery(await searchParams);
  const requests = await listRequests(query);
  const filtered = hasActiveFilters(query);

  return (
    // Filters mark themselves data-pending while a new list loads; the list dims.
    <div className="group/requests flex flex-col gap-3">
      <RequestFilters query={query} />
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        {countLabel(requests.length, filtered)}
      </p>
      <div className="transition-opacity group-has-data-pending/requests:opacity-60">
        {requests.length > 0 ? (
          <RequestList requests={requests} />
        ) : filtered ? (
          <NoMatchingRequests clearHref={buildRequestsHref({ sort: query.sort })} />
        ) : (
          <NoRequestsYet />
        )}
      </div>
    </div>
  );
}

function countLabel(count: number, filtered: boolean): string {
  const noun = count === 1 ? "request" : "requests";
  return filtered ? `${count} matching ${noun}` : `${count} ${noun}`;
}
