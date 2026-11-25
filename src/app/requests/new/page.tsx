import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "New request" };

export default function NewRequestPage() {
  return (
    <PageHeader
      title="New request"
      description="Tell the right team what you need. You can edit it later."
    />
  );
}
