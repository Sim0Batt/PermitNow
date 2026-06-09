// Server stores dates as yyyy-mm-dd; display them to the user as dd/mm/yyyy.
// Falls back to the original string if the input isn't in the expected format.
export function formatDateIt(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
