import { Suspense } from "react";
import { Breakdowns } from "@/components/dashboard/Breakdowns";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { RecentRequests } from "@/components/dashboard/RecentRequests";
import { StatCards } from "@/components/dashboard/StatCards";
import { PageContainer } from "@/components/layout/PageContainer";
import { loadRequestStats } from "@/lib/data/request-stats";

export default function DashboardPage() {
  return (
    <>
      <DashboardHero />
      <PageContainer className="sm:py-10">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardSections />
        </Suspense>
      </PageContainer>
    </>
  );
}

// R7: always current. Counts are read per request (and shared with the header
// logo and hero via loadRequestStats), so any create/edit/delete shows here.
async function DashboardSections() {
  const stats = await loadRequestStats();

  return (
    <div className="space-y-8">
      <section aria-labelledby="at-a-glance" className="space-y-3">
        <h2 id="at-a-glance" className="text-lg">
          At a glance
        </h2>
        <StatCards stats={stats} />
      </section>
      <Breakdowns stats={stats} />
      <RecentRequests />
    </div>
  );
}
