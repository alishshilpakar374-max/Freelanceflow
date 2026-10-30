import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { sessionChanged } from "@/features/auth/authSlice";
import {
  insertFollowUp,
  listFollowUps,
  patchFollowUpCompleted,
  removeFollowUp,
} from "@/features/follow-ups/followUpsApi";
import type { NewFollowUp } from "@/features/follow-ups/followUpsApi";
import { getErrorMessage } from "@/features/leads/leadsApi";
import { deleteLead } from "@/features/leads/leadsSlice";
import type { LoadStatus } from "@/features/leads/leadsSlice";
import type { RootState } from "@/lib/store";
import type { FollowUpTask } from "@/types";

interface FollowUpsState {
  items: FollowUpTask[];
  status: LoadStatus;
  error: string | null;
  ownerId: string | null;
}

const initialState: FollowUpsState = {
  items: [],
  status: "idle",
  error: null,
  ownerId: null,
};

interface ThunkConfig {
  rejectValue: string;
}

export const fetchFollowUps = createAsyncThunk<
  FollowUpTask[],
  string,
  ThunkConfig
>(
  "followUps/fetchFollowUps",
  async (_userId, { rejectWithValue }) => {
    try {
      return await listFollowUps();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not load your follow-ups."),
      );
    }
  },
  {
    condition: (_userId, { getState }) =>
      (getState() as { followUps: FollowUpsState }).followUps.status !==
      "loading",
  },
);

export const createFollowUp = createAsyncThunk<
  FollowUpTask,
  NewFollowUp,
  ThunkConfig
>("followUps/createFollowUp", async (input, { rejectWithValue }) => {
  try {
    return await insertFollowUp(input);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Could not add the follow-up."),
    );
  }
});

export const toggleFollowUp = createAsyncThunk<
  FollowUpTask,
  { id: string; completed: boolean },
  ThunkConfig
>(
  "followUps/toggleFollowUp",
  async ({ id, completed }, { rejectWithValue }) => {
    try {
      return await patchFollowUpCompleted(id, completed);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not update the follow-up."),
      );
    }
  },
);

export const deleteFollowUp = createAsyncThunk<string, string, ThunkConfig>(
  "followUps/deleteFollowUp",
  async (id, { rejectWithValue }) => {
    try {
      await removeFollowUp(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not delete the follow-up."),
      );
    }
  },
);

const followUpsSlice = createSlice({
  name: "followUps",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionChanged, (state, action) => {
        const nextUserId = action.payload?.id ?? null;
        const userChanged =
          state.ownerId !== null && nextUserId !== state.ownerId;

        if (nextUserId === null || userChanged) return initialState;
        return undefined;
      })

      .addCase(fetchFollowUps.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.ownerId = action.meta.arg;
      })
      .addCase(fetchFollowUps.fulfilled, (state, action) => {
        if (state.ownerId !== action.meta.arg) return;
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchFollowUps.rejected, (state, action) => {
        if (state.ownerId !== action.meta.arg) return;
        state.status = "failed";
        state.error = action.payload ?? "Could not load your follow-ups.";
      })

      .addCase(createFollowUp.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(toggleFollowUp.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteFollowUp.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      // The database cascades lead deletes to follow-ups. Mirror that in memory.
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.leadId !== action.payload,
        );
      });
  },
});

export const selectAllFollowUps = (state: RootState): FollowUpTask[] =>
  state.followUps.items;
export default followUpsSlice.reducer;
