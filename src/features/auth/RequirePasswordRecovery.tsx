import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";

export default function RequirePasswordRecovery() {
  const recoverySession = useAppSelector(
    (state) => state.auth.isPasswordRecovery,
  );

  if (!recoverySession) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
