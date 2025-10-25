/**
 * Converts ISO timestamp to relative time (2 hours ago, Yesterday, Mar 15)
 *
 * @param isoString - ISO 8601 timestamp string
 * @returns Human-readable relative time string
 *
 * @example
 * formatRelativeTime("2024-03-15T10:30:00Z") // "2 hours ago"
 * formatRelativeTime("2024-03-14T10:30:00Z") // "Yesterday"
 * formatRelativeTime("2024-03-01T10:30:00Z") // "Mar 1"
 */
export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  // Just now (< 1 minute)
  if (diffMins < 1) {
    return "Just now";
  }

  // Minutes ago (< 1 hour)
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  }

  // Hours ago (< 24 hours)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  // Yesterday
  if (diffDays === 1) {
    return "Yesterday";
  }

  // Days ago (< 7 days)
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // Format as "Mar 15"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Formats date to full readable format
 *
 * @param isoString - ISO 8601 timestamp string
 * @returns Formatted date string
 *
 * @example
 * formatFullDate("2024-03-15T10:30:00Z") // "March 15, 2024"
 */
export function formatFullDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
