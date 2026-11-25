import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Requests" };

export default function RequestsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Requests"
        description="Search, filter and update every request in one place."
      />
    </PageContainer>
  );
}
