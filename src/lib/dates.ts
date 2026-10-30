export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7); // '2026-10'
}

export function lastMonths(
  count: number,
): Array<{ key: string; label: string }> {
  const now = new Date();
  const months: Array<{ key: string; label: string }> = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      key: monthKey(toISODate(date)),
      label: date.toLocaleString("en-US", { month: "short" }),
    });
  }

  return months;
}
