import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileNavOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    openMobileNav(state) {
      state.mobileNavOpen = true;
    },
    closeMobileNav(state) {
      state.mobileNavOpen = false;
    },
  },
});

export const { toggleSidebar, openMobileNav, closeMobileNav } = uiSlice.actions;
export default uiSlice.reducer;
