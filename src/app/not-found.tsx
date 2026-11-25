import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-medium text-muted-foreground tabular-nums">404</p>
      <h1 className="mt-2 text-2xl">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted-foreground">
        The link may be out of date, or the request it pointed to was deleted.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button asChild size="lg">
          <Link href="/requests">Go to requests</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
