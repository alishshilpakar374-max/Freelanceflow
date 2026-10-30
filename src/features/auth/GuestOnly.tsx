import { Navigate, Outlet, useLocation } from "react-router-dom";
import FullPageSpinner from "@/components/ui/FullPageSpinner";
import { getRedirectTarget } from "@/features/auth/redirect";
import { useAppSelector } from "@/hooks/redux";

// Wraps /login and /signup. Already signed in? You don't belong here.
// This is also what moves you onward right after a successful login.
export default function GuestOnly() {
  const status = useAppSelector((state) => state.auth.status);
  const location = useLocation();

  if (status === "loading") return <FullPageSpinner />;
  if (status === "authenticated")
    return <Navigate to={getRedirectTarget(location.state)} replace />;

  return <Outlet />;
}
