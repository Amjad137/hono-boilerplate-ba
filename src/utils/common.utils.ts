/**
 * Converts a date to a user-friendly string, e.g., 'Aug 10, 2024'.
 * @param date - The date to format (string or Date)
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
