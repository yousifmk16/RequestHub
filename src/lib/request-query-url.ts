import type { RequestQuery } from "@/lib/validation";

/**
 * A query as URL search params. Defaults are left out (sort=newest, empty
 * search), so links stay short and "no filters" has no query string at all.
 */
function toQueryString(query: Partial<RequestQuery>): string {
  const params = new URLSearchParams();
  const search = query.q?.trim();
  if (search) params.set("q", search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.priority) params.set("priority", query.priority);
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);
  return params.toString();
}

function withQuery(path: string, query: Partial<RequestQuery>): string {
  const queryString = toQueryString(query);
  return queryString ? `${path}?${queryString}` : path;
}

/** The /requests URL for a query. */
export function buildRequestsHref(query: Partial<RequestQuery>): string {
  return withQuery("/requests", query);
}

/** The CSV download for the same query: identical params, so the file matches the list. */
export function buildExportHref(query: Partial<RequestQuery>): string {
  return withQuery("/api/requests/export", query);
}

/** Whether anything narrows the list (sorting only reorders it). */
export function hasActiveFilters(query: Partial<RequestQuery>): boolean {
  return Boolean(query.q?.trim() || query.category || query.status || query.priority);
}
