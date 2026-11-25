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
import { countByStatus, listRequests } from "@/lib/services/requests";
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

  // One query without the status filter feeds both the status chip counts and
  // the list, so the counts always agree with what the chips will show.
  const matchingAnyStatus = await listRequests({ ...query, status: undefined });
  const requests = query.status
    ? matchingAnyStatus.filter((request) => request.status === query.status)
    : matchingAnyStatus;

  return (
    // Filters mark themselves data-pending while a new list loads; the list dims.
    <div className="group/requests flex flex-col gap-4">
      <RequestFilters
        query={query}
        statusCounts={countByStatus(matchingAnyStatus)}
        resultCount={requests.length}
      />
      <div className="transition-opacity group-has-data-pending/requests:opacity-60">
        {requests.length > 0 ? (
          <RequestList requests={requests} />
        ) : hasActiveFilters(query) ? (
          <NoMatchingRequests clearHref={buildRequestsHref({ sort: query.sort })} />
        ) : (
          <NoRequestsYet />
        )}
      </div>
    </div>
  );
}
