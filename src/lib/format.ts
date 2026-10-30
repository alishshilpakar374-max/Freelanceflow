const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(amount: number): string {
  return currency.format(amount);
}

export function formatCompactCurrency(amount: number): string {
  return compactCurrency.format(amount);
}

// 'YYYY-MM-DD' -> 'Oct 29'. Built from parts to avoid UTC timezone shifts.
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(isoDateTime: string): string {
  const minutes = Math.floor(
    (Date.now() - new Date(isoDateTime).getTime()) / 60_000,
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(isoDateTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const preciseCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Two decimals, for payments and balances where cents matter.
export function formatMoney(amount: number): string {
  return preciseCurrency.format(amount);
}

// 'YYYY-MM-DD' -> 'Oct 29, 2026'. Built from parts to avoid UTC timezone shifts.
export function formatFullDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
