import { Prisma, type Request } from "@/generated/prisma/client";
import type { Category, Priority, Status } from "@/generated/prisma/enums";
import { CATEGORIES, PRIORITIES, PRIORITY_WEIGHT, STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import type { RequestCreateInput, RequestQuery, RequestUpdateInput } from "@/lib/validation";

/**
 * All database access for requests. Routes and pages call these functions and
 * never import Prisma, so storage details (and Prisma's error codes) stay here.
 * Inputs are expected to be validated already (see src/lib/validation.ts).
 */

export type { Request };

export type RequestStats = {
  total: number;
  byStatus: Record<Status, number>;
  byCategory: Record<Category, number>;
  byPriority: Record<Priority, number>;
};

export async function listRequests(query: RequestQuery): Promise<Request[]> {
  const where: Prisma.RequestWhereInput = {
    category: query.category,
    priority: query.priority,
    status: query.status,
    // On SQLite `contains` is a LIKE match: case-insensitive for ASCII letters.
    OR: query.q
      ? [{ title: { contains: query.q } }, { description: { contains: query.q } }]
      : undefined,
  };

  const matches = await db.request.findMany({
    where,
    orderBy: { createdAt: query.sort === "oldest" ? "asc" : "desc" },
  });

  // Prisma doesn't escape `%` and `_` inside a SQLite LIKE, so a search for
  // "50%" would also match "500". A wildcard match is always a superset of the
  // literal match, so narrowing the rows here gives exact results.
  const searchTerm = query.q?.toLowerCase();
  const requests = searchTerm
    ? matches.filter((request) => containsText(request, searchTerm))
    : matches;

  // Enum text can't be ordered by weight in SQL here (see PRIORITY_WEIGHT).
  // The sort is stable, so equal priorities keep the newest-first order.
  if (query.sort === "priority") {
    return requests.toSorted((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
  }
  return requests;
}

function containsText(request: Request, lowerCaseTerm: string): boolean {
  return (
    request.title.toLowerCase().includes(lowerCaseTerm) ||
    request.description.toLowerCase().includes(lowerCaseTerm)
  );
}

/** How many of the given requests are in each status (every status present). */
export function countByStatus(requests: Pick<Request, "status">[]): Record<Status, number> {
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<Status, number>;
  for (const request of requests) counts[request.status] += 1;
  return counts;
}

export async function listRecentRequests(limit = 5): Promise<Request[]> {
  return db.request.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function getRequest(id: string): Promise<Request | null> {
  return db.request.findUnique({ where: { id } });
}

export async function createRequest(input: RequestCreateInput): Promise<Request> {
  return db.request.create({ data: input });
}

/** Returns null when no request has this id. */
export async function updateRequest(id: string, input: RequestUpdateInput): Promise<Request | null> {
  try {
    return await db.request.update({ where: { id }, data: input });
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

/** Returns false when no request has this id. */
export async function deleteRequest(id: string): Promise<boolean> {
  try {
    await db.request.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isRecordNotFound(error)) return false;
    throw error;
  }
}

export async function getRequestStats(): Promise<RequestStats> {
  const [byStatus, byCategory, byPriority] = await Promise.all([
    db.request.groupBy({ by: ["status"], _count: { _all: true } }),
    db.request.groupBy({ by: ["category"], _count: { _all: true } }),
    db.request.groupBy({ by: ["priority"], _count: { _all: true } }),
  ]);

  const statusCounts = countPerValue(STATUSES, byStatus, (group) => group.status);
  return {
    total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
    byStatus: statusCounts,
    byCategory: countPerValue(CATEGORIES, byCategory, (group) => group.category),
    byPriority: countPerValue(PRIORITIES, byPriority, (group) => group.priority),
  };
}

// groupBy only returns values that have rows; charts and stat cards need
// every value present, so missing ones are filled with 0.
function countPerValue<Value extends string, Group extends { _count: { _all: number } }>(
  values: readonly Value[],
  groups: Group[],
  valueOf: (group: Group) => Value,
): Record<Value, number> {
  const counts = Object.fromEntries(values.map((value) => [value, 0])) as Record<Value, number>;
  for (const group of groups) counts[valueOf(group)] = group._count._all;
  return counts;
}

// P2025: "An operation failed because it depends on one or more records that
// were required but not found" (update/delete on a missing id).
function isRecordNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
