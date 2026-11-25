import { connection } from "next/server";
import { cache } from "react";
import { getRequestStats } from "@/lib/services/requests";

/**
 * Request counts for the current page view. The header logo, dashboard hero
 * and dashboard sections all need them; React's cache() runs the query once
 * per request however many components ask.
 *
 * connection() makes it a request-time read rather than build-time data (see
 * docs/decisions.md D4). Callers that wrap this in try/catch must call
 * connection() themselves first, outside the try: during prerendering it
 * signals Next by throwing.
 */
export const loadRequestStats = cache(async () => {
  await connection();
  return getRequestStats();
});
