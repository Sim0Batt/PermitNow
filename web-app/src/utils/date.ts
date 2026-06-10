// Server stores dates as yyyy-mm-dd; display them to the user as dd/mm/yyyy.
// Falls back to the original string if the input isn't in the expected format.
export function formatDateIt(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

// Today's date as yyyy-mm-dd in the local timezone (comparable to server dates).
function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// True when a yyyy-mm-dd date is strictly before today. ISO strings sort
// chronologically, so this comparison is timezone-safe. Unparsable input → false.
export function isPastDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return dateStr < todayIso();
}
