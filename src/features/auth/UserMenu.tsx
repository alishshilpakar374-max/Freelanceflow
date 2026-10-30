import { useState } from "react";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { toastAdded } from "@/components/layout/toastSlice";
import Button from "@/components/ui/Button";
import { signOut } from "@/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

export default function UserMenu() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const displayName = user.fullName || user.email;
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const result = await signOut();

      // On success, RequireAuth redirects to /login.
      if (!result.ok) {
        dispatch(toastAdded(result.message, "error"));
        setIsSigningOut(false);
      }
    } catch {
      dispatch(toastAdded("Could not sign out. Please try again.", "error"));
      setIsSigningOut(false);
    }
  };

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

        <span className="hidden max-w-40 truncate text-sm md:block">
          {displayName}
        </span>
      </Link>

      <Button
        variant="ghost"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
