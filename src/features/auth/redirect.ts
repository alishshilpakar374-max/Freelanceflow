// Reads the "where were you going?" path from router state, and refuses anything
// that isn't a plain in-app path. This blocks open-redirect tricks like "//evil.com".
export function getRedirectTarget(state: unknown): string {
  if (
    typeof state === "object" &&
    state !== null &&
    "from" in state &&
    typeof state.from === "string"
  ) {
    const from = state.from;
    const isInternal = from.startsWith("/") && !from.startsWith("//");
    const isAuthPage = from.startsWith("/login") || from.startsWith("/signup");
    if (isInternal && !isAuthPage) return from;
  }
  return "/";
}
