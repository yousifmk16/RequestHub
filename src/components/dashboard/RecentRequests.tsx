import Link from "next/link";
import { connection } from "next/server";
import { RelativeTime } from "@/components/requests/RelativeTime";
import { StatusBadge } from "@/components/requests/StatusBadge";
import { CATEGORY_TAB_CLASS } from "@/components/requests/styles";
import { CATEGORY_LABELS } from "@/lib/constants";
import { listRecentRequests } from "@/lib/services/requests";
import { cn } from "@/lib/utils";

const RECENT_COUNT = 5;

/** The newest requests, each linking to its edit page. */
export async function RecentRequests() {
  await connection(); // request-time read (docs/decisions.md D4)
  const requests = await listRecentRequests(RECENT_COUNT);

  return (
    <section aria-labelledby="recent-requests" className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="recent-requests" className="text-lg">
          Latest requests
        </h2>
        {requests.length > 0 && (
          <Link
            href="/requests"
            className="rounded-sm text-sm font-bold text-accent-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View all
          </Link>
        )}
      </div>

      {requests.length === 0 ? (
        <p className="mt-6 rounded-lg bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
          No requests yet.{" "}
          <Link href="/requests/new" className="font-bold text-foreground underline">
            Create the first one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 divide-y">
          {requests.map((request) => (
            <li key={request.id} className="relative flex items-center gap-3 py-3 ps-4">
              <span
                aria-hidden="true"
                className={cn("absolute inset-y-3 start-0 w-1 rounded-full", CATEGORY_TAB_CLASS[request.category])}
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/requests/${request.id}/edit`}
                  className="line-clamp-1 font-bold [overflow-wrap:anywhere] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {request.title}
                </Link>
                <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                  <span>{CATEGORY_LABELS[request.category]}</span>
                  <RelativeTime date={request.createdAt} />
                </p>
              </div>
              <StatusBadge status={request.status} className="shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
