import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "freelanceflow-theme";

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage can be unavailable (private mode, blocked storage)
  }
  return "system";
}

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: getInitialMode(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
