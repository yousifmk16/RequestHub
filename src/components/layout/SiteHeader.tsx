import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LiveWorkloadMark } from "@/components/brand/LiveWorkloadMark";
import { WorkloadMark } from "@/components/brand/WorkloadMark";
import { Button } from "@/components/ui/button";
import { MainNav } from "./MainNav";
import { MobileNav } from "./MobileNav";

// Lakeora-navy header. The logo is a live workload meter (see src/lib/workload.ts).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-brand-navy text-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md text-base font-extrabold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {/* Reading the counts is the only uncached work in the header; the
              plain mark shows until it arrives, so the header never waits. */}
          <Suspense fallback={<WorkloadMark />}>
            <LiveWorkloadMark />
          </Suspense>
          Request Hub
        </Link>

        <MainNav className="hidden md:flex" />

        <div className="ms-auto flex items-center gap-1">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-brand-red-strong px-3.5 text-white hover:bg-brand-red-strong/90 focus-visible:ring-white/60 sm:px-4"
          >
            <Link href="/requests/new">
              <PlusIcon />
              <span className="sr-only sm:not-sr-only">New request</span>
            </Link>
          </Button>
          <MobileNav className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
