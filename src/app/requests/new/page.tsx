import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "New request" };

export default function NewRequestPage() {
  return (
    <PageContainer>
      <PageHeader
        title="New request"
        description="Tell the right team what you need. You can edit it later."
      />
    </PageContainer>
  );
}
