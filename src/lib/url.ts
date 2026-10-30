export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidWebsite(value: string): boolean {
  const normalized = normalizeWebsite(value);
  if (normalized === "") return true; // website is optional

  try {
    return new URL(normalized).hostname.includes(".");
  } catch {
    return false;
  }
}
