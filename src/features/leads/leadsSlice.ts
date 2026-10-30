import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { sessionChanged } from "@/features/auth/authSlice";
import {
  getErrorMessage,
  insertLead,
  listLeads,
  patchLead,
  persistLeadStatus,
  removeLead,
} from "@/features/leads/leadsApi";
import type { RootState } from "@/lib/store";
import type { Lead, LeadInput, LeadStatus } from "@/types";

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface LeadsState {
  items: Lead[];
  movingIds: string[]; // leads whose status change is still being saved
  status: LoadStatus;
  error: string | null;
  ownerId: string | null; // which user these leads belong to
}

const initialState: LeadsState = {
  items: [],
  movingIds: [],
  status: "idle",
  error: null,
  ownerId: null,
};

interface ThunkConfig {
  rejectValue: string;
}

// The argument is the user id. We store it as `ownerId` so a late response
// from a previous user can be recognised and ignored.
export const fetchLeads = createAsyncThunk<Lead[], string, ThunkConfig>(
  "leads/fetchLeads",
  async (_userId, { rejectWithValue }) => {
    try {
      return await listLeads();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not load your leads."),
      );
    }
  },
  {
    // Don't start a second request while one is running (React StrictMode runs effects twice in dev).
    condition: (_userId, { getState }) =>
      (getState() as { leads: LeadsState }).leads.status !== "loading",
  },
);

export const createLead = createAsyncThunk<Lead, LeadInput, ThunkConfig>(
  "leads/createLead",
  async (input, { rejectWithValue }) => {
    try {
      return await insertLead(input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Could not add the lead."));
    }
  },
);

export const updateLead = createAsyncThunk<
  Lead,
  { id: string; changes: LeadInput },
  ThunkConfig
>("leads/updateLead", async ({ id, changes }, { rejectWithValue }) => {
  try {
    return await patchLead(id, changes);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Could not save your changes."),
    );
  }
});

export const deleteLead = createAsyncThunk<string, string, ThunkConfig>(
  "leads/deleteLead",
  async (id, { rejectWithValue }) => {
    try {
      await removeLead(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not delete the lead."),
      );
    }
  },
);

export interface MoveLeadArgs {
  id: string;
  status: LeadStatus;
  previousStatus: LeadStatus;
}

export const moveLead = createAsyncThunk<void, MoveLeadArgs>(
  "leads/moveLead",
  async ({ id, status }) => {
    await persistLeadStatus(id, status);
  },
);

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- Sign-out / user switch: wipe everything -------------------------------
      .addCase(sessionChanged, (state, action) => {
        const nextUserId = action.payload?.id ?? null;
        const userChanged =
          state.ownerId !== null && nextUserId !== state.ownerId;

        if (nextUserId === null || userChanged) return initialState;
        return undefined;
      })

      // ---- Loading ----------------------------------------------------------------
      .addCase(fetchLeads.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.ownerId = action.meta.arg;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        if (state.ownerId !== action.meta.arg) return; // user changed while loading: ignore
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        if (state.ownerId !== action.meta.arg) return;
        state.status = "failed";
        state.error = action.payload ?? "Could not load your leads.";
      })

      // ---- Create / update / delete: only change the store once the DB agrees --------
      .addCase(createLead.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (lead) => lead.id === action.payload.id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.items = state.items.filter((lead) => lead.id !== action.payload);
      })

      // ---- Pipeline move: optimistic, with rollback (unchanged from 4B) ---------------
      .addCase(moveLead.pending, (state, action) => {
        const { id, status } = action.meta.arg;
        const lead = state.items.find((item) => item.id === id);
        if (lead) lead.status = status;
        state.movingIds.push(id);
      })
      .addCase(moveLead.fulfilled, (state, action) => {
        state.movingIds = state.movingIds.filter(
          (id) => id !== action.meta.arg.id,
        );
      })
      .addCase(moveLead.rejected, (state, action) => {
        const { id, previousStatus } = action.meta.arg;
        const lead = state.items.find((item) => item.id === id);
        if (lead) lead.status = previousStatus;
        state.movingIds = state.movingIds.filter((movingId) => movingId !== id);
      });
  },
});

export const selectAllLeads = (state: RootState): Lead[] => state.leads.items;
export default leadsSlice.reducer;
