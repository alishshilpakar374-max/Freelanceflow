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
  isPasswordRecovery: boolean;
}

const initialState: AuthState = {
  status: "loading",
  user: null,
  isPasswordRecovery: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionChanged(state, action: PayloadAction<AuthUser | null>) {
      const next = action.payload;
      const current = state.user;

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

      if (!next) {
        state.isPasswordRecovery = false;
      }
    },

    setPasswordRecovery(state, action: PayloadAction<boolean>) {
      state.isPasswordRecovery = action.payload;
    },
  },
});

export const { sessionChanged, setPasswordRecovery } = authSlice.actions;
export default authSlice.reducer;
