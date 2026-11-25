import { z } from "zod";
import { Category, Priority, Status } from "@/generated/prisma/enums";
import {
  DESCRIPTION_LENGTH,
  SEARCH_MAX_LENGTH,
  SORT_OPTIONS,
  TITLE_LENGTH,
} from "@/lib/constants";

/**
 * The single contract for Request input. The form (client) and the API routes
 * (server) both validate with these schemas, so the rules can't drift apart.
 */

const title = z
  .string({ error: "Title is required" })
  .trim()
  .min(TITLE_LENGTH.min, { error: `Title must be at least ${TITLE_LENGTH.min} characters` })
  .max(TITLE_LENGTH.max, { error: `Title must be at most ${TITLE_LENGTH.max} characters` });

const description = z
  .string({ error: "Description is required" })
  .trim()
  .min(DESCRIPTION_LENGTH.min, {
    error: `Description must be at least ${DESCRIPTION_LENGTH.min} characters`,
  })
  .max(DESCRIPTION_LENGTH.max, {
    error: `Description must be at most ${DESCRIPTION_LENGTH.max} characters`,
  });

const category = z.enum(Category, { error: "Choose a category" });
const priority = z.enum(Priority, { error: "Choose a priority" });
const status = z.enum(Status, { error: "Choose a valid status" });

// Status is not accepted on create: every new request starts as NEW.
export const requestCreateSchema = z.object({ title, description, category, priority });

// Every field optional so the list can PATCH just the status, but an empty
// update is rejected rather than silently doing nothing.
export const requestUpdateSchema = z
  .object({ title, description, category, priority, status })
  .partial()
  .refine((fields) => Object.values(fields).some((value) => value !== undefined), {
    error: "Provide at least one field to update",
  });

/**
 * Filters, search and sort come from the URL, which anyone can edit. Invalid
 * values fall back to "no filter" / the default sort instead of erroring, so a
 * mistyped or stale link still shows a sensible list.
 */
export const requestQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(SEARCH_MAX_LENGTH)
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  category: category.optional().catch(undefined),
  priority: priority.optional().catch(undefined),
  status: status.optional().catch(undefined),
  sort: z.enum(SORT_OPTIONS).default("newest").catch("newest"),
});

export type RequestCreateInput = z.infer<typeof requestCreateSchema>;
export type RequestUpdateInput = z.infer<typeof requestUpdateSchema>;
export type RequestQuery = z.infer<typeof requestQuerySchema>;

type SearchParamsLike = URLSearchParams | Record<string, string | string[] | undefined>;

/** Parses URL search params (Next.js page props or a Request URL) into a query. */
export function parseRequestQuery(searchParams: SearchParamsLike): RequestQuery {
  const raw =
    searchParams instanceof URLSearchParams ? Object.fromEntries(searchParams) : searchParams;
  return requestQuerySchema.parse(raw);
}
