import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { sessionChanged } from "@/features/auth/authSlice";
import { getErrorMessage } from "@/features/leads/leadsApi";
import type { LoadStatus } from "@/features/leads/leadsSlice";
import {
  insertPayment,
  insertProject,
  listProjectsAndPayments,
  patchProject,
  removePayment,
  removeProject,
} from "@/features/projects/projectsApi";
import type { ProjectsData } from "@/features/projects/projectsApi";
import type { RootState } from "@/lib/store";
import type { Payment, PaymentInput, Project, ProjectInput } from "@/types";

interface ProjectsState {
  projects: Project[];
  payments: Payment[];
  status: LoadStatus;
  error: string | null;
  ownerId: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  payments: [],
  status: "idle",
  error: null,
  ownerId: null,
};

interface ThunkConfig {
  rejectValue: string;
}

export const fetchProjects = createAsyncThunk<
  ProjectsData,
  string,
  ThunkConfig
>(
  "projects/fetchProjects",
  async (_userId, { rejectWithValue }) => {
    try {
      return await listProjectsAndPayments();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not load your projects."),
      );
    }
  },
  {
    condition: (_userId, { getState }) =>
      (getState() as { projects: ProjectsState }).projects.status !== "loading",
  },
);

export const createProject = createAsyncThunk<
  Project,
  ProjectInput,
  ThunkConfig
>("projects/createProject", async (input, { rejectWithValue }) => {
  try {
    return await insertProject(input);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Could not create the project."),
    );
  }
});

export const updateProject = createAsyncThunk<
  Project,
  { id: string; changes: ProjectInput },
  ThunkConfig
>("projects/updateProject", async ({ id, changes }, { rejectWithValue }) => {
  try {
    return await patchProject(id, changes);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Could not save your changes."),
    );
  }
});

export const deleteProject = createAsyncThunk<string, string, ThunkConfig>(
  "projects/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      await removeProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not delete the project."),
      );
    }
  },
);

export const createPayment = createAsyncThunk<
  Payment,
  PaymentInput,
  ThunkConfig
>("projects/createPayment", async (input, { rejectWithValue }) => {
  try {
    return await insertPayment(input);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Could not record the payment."),
    );
  }
});

export const deletePayment = createAsyncThunk<string, string, ThunkConfig>(
  "projects/deletePayment",
  async (id, { rejectWithValue }) => {
    try {
      await removePayment(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not delete the payment."),
      );
    }
  },
);

const projectsSlice = createSlice({
  name: "projects",
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

      .addCase(fetchProjects.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.ownerId = action.meta.arg;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        if (state.ownerId !== action.meta.arg) return;
        state.projects = action.payload.projects;
        state.payments = action.payload.payments;
        state.status = "succeeded";
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        if (state.ownerId !== action.meta.arg) return;
        state.status = "failed";
        state.error = action.payload ?? "Could not load your projects.";
      })

      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (project) => project.id === action.payload.id,
        );
        if (index !== -1) state.projects[index] = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload,
        );
        // The database cascades project deletes to payments. Mirror that in memory.
        state.payments = state.payments.filter(
          (payment) => payment.projectId !== action.payload,
        );
      })

      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(
          (payment) => payment.id !== action.payload,
        );
      });
  },
});

export const selectProjects = (state: RootState): Project[] =>
  state.projects.projects;
export const selectPayments = (state: RootState): Payment[] =>
  state.projects.payments;
export default projectsSlice.reducer;
