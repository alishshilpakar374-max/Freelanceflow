import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

const initialState: AuthState = {
  status: "loading", // we don't know yet until Supabase reports the stored session
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionChanged(state, action: PayloadAction<AuthUser | null>) {
      const next = action.payload;
      const current = state.user;

      // Supabase re-announces the session on token refresh and tab focus.
      // If nothing really changed, keep the old object so components don't re-render.
      if (
        next !== null &&
        current !== null &&
        next.id === current.id &&
        next.email === current.email &&
        next.fullName === current.fullName
      ) {
        return;
      }

      state.user = next;
      state.status = next ? "authenticated" : "unauthenticated";
    },
  },
});

export const { sessionChanged } = authSlice.actions;
export default authSlice.reducer;
