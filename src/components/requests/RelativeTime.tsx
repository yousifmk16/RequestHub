import { formatDateTime, formatRelativeTime } from "@/lib/format";

/** "3 days ago", with the exact date on hover and in the markup. */
export function RelativeTime({ date, className }: { date: Date; className?: string }) {
  return (
    <time dateTime={date.toISOString()} title={formatDateTime(date)} className={className}>
      {formatRelativeTime(date)}
    </time>
  );
}
