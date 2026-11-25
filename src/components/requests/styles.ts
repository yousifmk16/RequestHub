import { CircleCheck, CircleDashed, LoaderCircle, type LucideIcon } from "lucide-react";
import type { Category, Status } from "@/generated/prisma/enums";

/*
 * Visual mapping for the enums. Class names are complete string literals so
 * Tailwind can find them. Colours come from the tokens in globals.css.
 */

/** Department routing tab colour (solid bar on the row's leading edge). */
export const CATEGORY_TAB_CLASS: Record<Category, string> = {
  IT: "bg-category-it",
  HR: "bg-category-hr",
  ADMINISTRATION: "bg-category-administration",
  OTHER: "bg-category-other",
};

/** Status pill: tinted background, strong text, and an icon (never colour alone). */
export const STATUS_STYLE: Record<Status, { className: string; icon: LucideIcon }> = {
  NEW: { className: "bg-status-new-tint text-status-new", icon: CircleDashed },
  IN_PROGRESS: { className: "bg-status-in-progress-tint text-status-in-progress", icon: LoaderCircle },
  COMPLETED: { className: "bg-status-completed-tint text-status-completed", icon: CircleCheck },
};
