import { readJsonBody, validationErrorResponse, withErrorHandling } from "@/lib/api";
import { createRequest, listRequests } from "@/lib/services/requests";
import { parseRequestQuery, requestCreateSchema } from "@/lib/validation";

// GET /api/requests?q=&category=&status=&priority=&sort=
export const GET = withErrorHandling(async (request: Request) => {
  const query = parseRequestQuery(new URL(request.url).searchParams);
  return Response.json(await listRequests(query));
});

// POST /api/requests
export const POST = withErrorHandling(async (request: Request) => {
  const parsed = requestCreateSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const created = await createRequest(parsed.data);
  return Response.json(created, {
    status: 201,
    headers: { Location: `/api/requests/${created.id}` },
  });
});
