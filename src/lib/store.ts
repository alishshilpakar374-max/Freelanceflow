import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/features/settings/theme/themeSlice";
import uiReducer from "@/components/layout/uiSlice";
import toastReducer from "@/components/layout/toastSlice";
import leadsReducer from "@/features/leads/leadsSlice";
import authReducer from "@/features/auth/authSlice";
import activitiesReducer from "@/features/activities/activitiesSlice";
import followUpsReducer from "@/features/follow-ups/followUpsSlice";
import projectsReducer from "@/features/projects/projectsSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
    toast: toastReducer,
    leads: leadsReducer,
    auth: authReducer,
    activities: activitiesReducer,
    followUps: followUpsReducer,
    projects: projectsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
