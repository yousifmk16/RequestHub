import type { RequestQuery } from "@/lib/validation";

/**
 * Turns a query back into a /requests URL. Defaults are left out (sort=newest,
 * empty search), so links stay short and "no filters" is exactly /requests.
 */
export function buildRequestsHref(query: Partial<RequestQuery>): string {
  const params = new URLSearchParams();
  const search = query.q?.trim();
  if (search) params.set("q", search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.priority) params.set("priority", query.priority);
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort);

  const queryString = params.toString();
  return queryString ? `/requests?${queryString}` : "/requests";
}

/** Whether anything narrows the list (sorting only reorders it). */
export function hasActiveFilters(query: Partial<RequestQuery>): boolean {
  return Boolean(query.q?.trim() || query.category || query.status || query.priority);
}
