import {
  notFoundResponse,
  readJsonBody,
  validationErrorResponse,
  withErrorHandling,
} from "@/lib/api";
import { deleteRequest, getRequest, updateRequest } from "@/lib/services/requests";
import { requestUpdateSchema } from "@/lib/validation";

type Context = RouteContext<"/api/requests/[id]">;

// GET /api/requests/:id
export const GET = withErrorHandling(async (_request: Request, { params }: Context) => {
  const { id } = await params;
  const found = await getRequest(id);
  return found ? Response.json(found) : notFoundResponse();
});

// PATCH /api/requests/:id: any subset of fields, e.g. just { status }
export const PATCH = withErrorHandling(async (request: Request, { params }: Context) => {
  const { id } = await params;
  const parsed = requestUpdateSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const updated = await updateRequest(id, parsed.data);
  return updated ? Response.json(updated) : notFoundResponse();
});

// DELETE /api/requests/:id
export const DELETE = withErrorHandling(async (_request: Request, { params }: Context) => {
  const { id } = await params;
  const deleted = await deleteRequest(id);
  return deleted ? new Response(null, { status: 204 }) : notFoundResponse();
});
