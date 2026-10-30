import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  insertActivity,
  listActivities,
  removeActivity,
} from "@/features/activities/activitiesApi";
import type { NewActivity } from "@/features/activities/activitiesApi";
import { sessionChanged } from "@/features/auth/authSlice";
import { getErrorMessage } from "@/features/leads/leadsApi";
import { deleteLead } from "@/features/leads/leadsSlice";
import type { LoadStatus } from "@/features/leads/leadsSlice";
import type { RootState } from "@/lib/store";
import type { LeadActivity } from "@/types";

interface ActivitiesState {
  items: LeadActivity[];
  status: LoadStatus;
  error: string | null;
  ownerId: string | null;
}

const initialState: ActivitiesState = {
  items: [],
  status: "idle",
  error: null,
  ownerId: null,
};

interface ThunkConfig {
  rejectValue: string;
}

export const fetchActivities = createAsyncThunk<
  LeadActivity[],
  string,
  ThunkConfig
>(
  "activities/fetchActivities",
  async (_userId, { rejectWithValue }) => {
    try {
      return await listActivities();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not load your activity."),
      );
    }
  },
  {
    condition: (_userId, { getState }) =>
      (getState() as { activities: ActivitiesState }).activities.status !==
      "loading",
  },
);

export const createActivity = createAsyncThunk<
  LeadActivity,
  NewActivity,
  ThunkConfig
>("activities/createActivity", async (input, { rejectWithValue }) => {
  try {
    return await insertActivity(input);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Could not log the activity."),
    );
  }
});

export const deleteActivity = createAsyncThunk<string, string, ThunkConfig>(
  "activities/deleteActivity",
  async (id, { rejectWithValue }) => {
    try {
      await removeActivity(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not delete the activity."),
      );
    }
  },
);

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Sign-out or user switch: wipe everything (same pattern as leads)
      .addCase(sessionChanged, (state, action) => {
        const nextUserId = action.payload?.id ?? null;
        const userChanged =
          state.ownerId !== null && nextUserId !== state.ownerId;

        if (nextUserId === null || userChanged) return initialState;
        return undefined;
      })

      .addCase(fetchActivities.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.ownerId = action.meta.arg;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        if (state.ownerId !== action.meta.arg) return;
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        if (state.ownerId !== action.meta.arg) return;
        state.status = "failed";
        state.error = action.payload ?? "Could not load your activity.";
      })

      .addCase(createActivity.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // newest first
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (activity) => activity.id !== action.payload,
        );
      })

      // The database cascades lead deletes to activities. Mirror that in memory.
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (activity) => activity.leadId !== action.payload,
        );
      });
  },
});

export const selectAllActivities = (state: RootState): LeadActivity[] =>
  state.activities.items;
export default activitiesSlice.reducer;
