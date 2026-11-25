import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildExportHref } from "@/lib/request-query-url";
import type { RequestQuery } from "@/lib/validation";

/**
 * Downloads the current view as CSV. A plain <a>, not next/link: it points at
 * an API route that answers with a file, so there is nothing to navigate to.
 */
export function ExportCsvButton({ query }: { query: RequestQuery }) {
  return (
    <Button asChild variant="outline" className="h-10">
      <a href={buildExportHref(query)} download>
        <Download /> Export CSV
      </a>
    </Button>
  );
}
