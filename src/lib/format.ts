const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "just now", "5 minutes ago", "yesterday", "3 weeks ago". */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const secondsAgo = Math.round((now.getTime() - date.getTime()) / 1000);
  if (secondsAgo < 45) return "just now";

  for (const [unit, secondsPerUnit] of UNITS) {
    if (secondsAgo >= secondsPerUnit) {
      return relativeFormatter.format(-Math.floor(secondsAgo / secondsPerUnit), unit);
    }
  }
  return relativeFormatter.format(-1, "minute");
}

/** Exact timestamp for tooltips, e.g. "25 Nov 2026, 14:05". */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

/** Whole-number percentage of a total; 0 when the total is 0 (no divide-by-zero). */
export function percentOf(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}
