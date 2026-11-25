import type { Metadata } from "next";
import { BackLink } from "@/components/layout/BackLink";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestForm } from "@/components/requests/form/RequestForm";

export const metadata: Metadata = { title: "New request" };

export default function NewRequestPage() {
  return (
    <PageContainer className="max-w-3xl">
      <BackLink href="/requests">All requests</BackLink>
      <PageHeader
        title="New request"
        description="Tell the right team what you need. You can edit it later."
      />
      <RequestForm mode="create" />
    </PageContainer>
  );
}
