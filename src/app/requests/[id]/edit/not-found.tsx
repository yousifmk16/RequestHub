import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { BackLink } from "@/components/layout/BackLink";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

// Shown when the id in the URL matches no request (R3). Next renders this in
// place of the page, so it brings its own container.
export default function RequestNotFound() {
  return (
    <PageContainer className="max-w-3xl">
      <BackLink href="/requests">All requests</BackLink>
      <div className="flex flex-col items-center rounded-xl border border-dashed bg-card px-6 py-14 text-center">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-secondary text-brand-slate">
          <FileQuestion className="size-6" />
        </span>
        <h1 className="mt-4 text-xl">This request doesn&apos;t exist</h1>
        <p className="mt-1 max-w-sm text-muted-foreground">
          It may have been deleted, or the link has a typo. Everything that still exists is in the list.
        </p>
        <Button asChild className="mt-6">
          <Link href="/requests">Go to all requests</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
