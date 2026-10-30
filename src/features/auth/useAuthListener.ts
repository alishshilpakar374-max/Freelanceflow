import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

import { sessionChanged } from "@/features/auth/authSlice";
import type { AuthUser } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import { supabase } from "@/lib/supabase";

function toAuthUser(user: User): AuthUser {
  const name: unknown = user.user_metadata.full_name;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: typeof name === "string" ? name : "",
  };
}

export function useAuthListener(): void {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Temporary debugging
      console.log("AUTH EVENT:", event);
      console.log("AUTH SESSION:", session);
      console.log("AUTH USER:", session?.user?.email ?? "No user");

      // Update Redux authentication state
      dispatch(sessionChanged(session ? toAuthUser(session.user) : null));

      // Handle password recovery
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [dispatch, navigate]);
}
