import { withErrorHandling } from "@/lib/api";
import { CSV_BOM, requestsToCsv } from "@/lib/csv";
import { listRequests } from "@/lib/services/requests";
import { parseRequestQuery } from "@/lib/validation";

// GET /api/requests/export?q=&category=&status=&priority=&sort=
// The same tolerant parse and the same service call as the list page, so the
// file always holds exactly the rows (and order) on screen.
export const GET = withErrorHandling(async (request: Request) => {
  const query = parseRequestQuery(new URL(request.url).searchParams);
  const requests = await listRequests(query);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(CSV_BOM + requestsToCsv(requests), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="requests-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
