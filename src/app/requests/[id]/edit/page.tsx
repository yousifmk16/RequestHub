import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/BackLink";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeleteRequestButton } from "@/components/requests/DeleteRequestButton";
import { RequestForm } from "@/components/requests/form/RequestForm";
import { RequestFormSkeleton } from "@/components/requests/form/RequestFormSkeleton";
import { RelativeTime } from "@/components/requests/RelativeTime";
import { getRequest } from "@/lib/services/requests";

export const metadata: Metadata = { title: "Edit request" };

export default function EditRequestPage({ params }: PageProps<"/requests/[id]/edit">) {
  return (
    <PageContainer className="max-w-3xl">
      <BackLink href="/requests">All requests</BackLink>
      <Suspense fallback={<RequestFormSkeleton />}>
        <EditRequest params={params} />
      </Suspense>
    </PageContainer>
  );
}

async function EditRequest({ params }: Pick<PageProps<"/requests/[id]/edit">, "params">) {
  await connection(); // always read at request time (docs/decisions.md D4)
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound(); // R3: a missing request shows the 404 page

  const { title, description, category, priority, status } = request;
  return (
    <>
      <PageHeader
        title="Edit request"
        description={
          <>
            Created <RelativeTime date={request.createdAt} />, last updated{" "}
            <RelativeTime date={request.updatedAt} />.
          </>
        }
        actions={<DeleteRequestButton requestId={id} requestTitle={title} trigger="button" redirectTo="/requests" />}
      />
      <RequestForm
        mode="edit"
        requestId={id}
        initialValues={{ title, description, category, priority, status }}
      />
    </>
  );
}
