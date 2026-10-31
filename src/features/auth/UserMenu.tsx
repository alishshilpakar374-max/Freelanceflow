import { Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";

export default function UserMenu() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  const displayName = user.fullName || user.email;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/settings?section=profile"
        className="flex min-w-0 items-center gap-2 rounded-lg hover:text-primary"
        aria-label="Open settings"
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          aria-hidden="true"
        >
          {initial}
        </div>

        <span className="block max-w-40 truncate text-sm ">{displayName}</span>
      </Link>
    </div>
  );
}
