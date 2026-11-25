import { Category, Priority, Status } from "@/generated/prisma/enums";

/**
 * Display labels, ordering and limits for the Request enums. Everything that
 * shows or sorts a category/priority/status reads from here, so adding a value
 * means touching the Prisma schema and this file only.
 */

export const CATEGORY_LABELS: Record<Category, string> = {
  IT: "IT",
  HR: "HR",
  ADMINISTRATION: "Administration",
  OTHER: "Other",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const STATUS_LABELS: Record<Status, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

// Ordered lists for selects, filters and charts (declaration order, not alphabetical).
export const CATEGORIES = Object.values(Category);
export const PRIORITIES = Object.values(Priority);
export const STATUSES = Object.values(Status);

// SQLite stores enums as text, so ORDER BY would give HIGH < LOW < MEDIUM.
// Sorting by priority uses these weights instead (see docs/decisions.md D2).
export const PRIORITY_WEIGHT: Record<Priority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export const SORT_OPTIONS = ["newest", "oldest", "priority"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  priority: "Highest priority",
};

export const TITLE_LENGTH = { min: 3, max: 100 } as const;
export const DESCRIPTION_LENGTH = { min: 10, max: 2000 } as const;
export const SEARCH_MAX_LENGTH = 100;
