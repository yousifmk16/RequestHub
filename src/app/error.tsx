"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Catches unexpected errors in any page below the root layout, so a failure
// (for example the database being unreachable) never leaves a blank screen.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center" role="alert">
      <h1 className="text-2xl">This page couldn&apos;t load</h1>
      <p className="mt-2 text-muted-foreground">
        Something went wrong while loading the data. Your requests are safe. Try again in a
        moment.
      </p>
      <Button size="lg" className="mt-6" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
