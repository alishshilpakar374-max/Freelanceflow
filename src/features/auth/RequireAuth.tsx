import { Navigate, Outlet, useLocation } from "react-router-dom";
import FullPageSpinner from "@/components/ui/FullPageSpinner";
import { useAppSelector } from "@/hooks/redux";

export default function RequireAuth() {
  const status = useAppSelector((state) => state.auth.status);
  const location = useLocation();

  // Don't redirect while we're still checking. That would bounce logged-in users to /login on refresh.
  if (status === "loading") return <FullPageSpinner />;

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
