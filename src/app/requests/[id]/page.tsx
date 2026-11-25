import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/BackLink";
import { PageContainer } from "@/components/layout/PageContainer";
import { RequestDetail } from "@/components/requests/RequestDetail";
import { RequestDetailSkeleton } from "@/components/requests/RequestDetailSkeleton";
import { getRequest } from "@/lib/services/requests";

export const metadata: Metadata = { title: "Request details" };

export default function RequestDetailPage({ params }: PageProps<"/requests/[id]">) {
  return (
    <PageContainer className="max-w-4xl">
      <BackLink href="/requests">All requests</BackLink>
      <Suspense fallback={<RequestDetailSkeleton />}>
        <RequestDetailContent params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function RequestDetailContent({ params }: Pick<PageProps<"/requests/[id]">, "params">) {
  await connection(); // always read at request time (docs/decisions.md D4)
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound(); // the shared request not-found page in this segment

  return <RequestDetail request={request} />;
}
