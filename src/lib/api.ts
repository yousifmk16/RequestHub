import { z } from "zod";

/**
 * Shared helpers for the API route handlers. Every error response has the same
 * JSON shape, `{ error: string, details?: ... }`, so the UI can always show a
 * readable message and map validation errors back onto form fields.
 */

export type ApiErrorBody = {
  error: string;
  details?: {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };
};

export function errorResponse(status: number, body: ApiErrorBody): Response {
  return Response.json(body, { status });
}

export function notFoundResponse(): Response {
  return errorResponse(404, { error: "Request not found" });
}

export function validationErrorResponse(error: z.ZodError): Response {
  const details = z.flattenError(error);
  return errorResponse(400, {
    // A form-level message (e.g. "Provide at least one field") is more
    // useful than a generic one when there is no specific field to point at.
    error: details.formErrors[0] ?? "Some fields are invalid. Please check and try again.",
    details,
  });
}

class InvalidJsonError extends Error {}

/** Reads the JSON body, turning malformed JSON into a 400 instead of a 500. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new InvalidJsonError();
  }
}

/**
 * Wraps a route handler so anything unexpected becomes a JSON 500 with a
 * generic message: internal details (SQL, stack traces) never reach the client.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof InvalidJsonError) {
        return errorResponse(400, { error: "Request body must be valid JSON" });
      }
      // Server-side log so the real cause is visible in Vercel/terminal logs.
      console.error("Unexpected API error", error);
      return errorResponse(500, { error: "Something went wrong. Please try again." });
    }
  };
}
