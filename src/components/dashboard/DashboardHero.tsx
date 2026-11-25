import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { HeroWorkload, HeroWorkloadPlaceholder } from "./HeroWorkload";

// Full-width navy band that opens the dashboard, echoing the lakeora.ai hero.
export function DashboardHero() {
  return (
    <section
      aria-labelledby="dashboard-title"
      // The header is navy too; a hairline keeps the two bands distinct.
      className="border-t border-white/10 bg-brand-navy text-white"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-xl">
          <h1 id="dashboard-title" className="text-[2.1rem] leading-[1.1] font-extrabold sm:text-5xl">
            Every request, from submitted to solved.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-on-navy-muted">
            See what&apos;s open across IT, HR and Administration, and raise a new request whenever
            you need something.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-11 rounded-full bg-brand-red-strong px-5 text-[15px] text-white hover:bg-brand-red-strong/90 focus-visible:ring-white/60"
            >
              <Link href="/requests/new">
                <PlusIcon />
                New request
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-white/35 bg-transparent px-5 text-[15px] text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/60"
            >
              <Link href="/requests">View all requests</Link>
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <Suspense fallback={<HeroWorkloadPlaceholder />}>
            <HeroWorkload />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
