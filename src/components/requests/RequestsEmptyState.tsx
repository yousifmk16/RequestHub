import { Inbox, SearchX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** No requests at all: invite the first one. */
export function NoRequestsYet() {
  return (
    <EmptyState
      icon={<Inbox />}
      title="No requests yet"
      description="When someone asks IT, HR or Administration for help, it shows up here."
      action={
        <Button asChild className="rounded-full bg-brand-red-strong px-5 text-white hover:bg-brand-red-strong/90">
          <Link href="/requests/new">Create the first request</Link>
        </Button>
      }
    />
  );
}

/** Filters or search match nothing: offer the way back. */
export function NoMatchingRequests({ clearHref }: { clearHref: string }) {
  return (
    <EmptyState
      icon={<SearchX />}
      title="No requests match these filters"
      description="Try a different search, or clear the filters to see every request."
      action={
        <Button asChild variant="outline">
          <Link href={clearHref}>Clear filters</Link>
        </Button>
      }
    />
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-secondary text-brand-slate [&_svg]:size-6">
        {icon}
      </span>
      <h2 className="mt-4 text-lg">{title}</h2>
      <p className="mt-1 max-w-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
