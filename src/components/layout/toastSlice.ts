import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ToastTone = "success" | "error";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  items: Toast[];
}

const initialState: ToastState = { items: [] };

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    toastAdded: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload);
      },
      prepare(message: string, tone: ToastTone = "success") {
        return { payload: { id: crypto.randomUUID(), message, tone } };
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { toastAdded, toastDismissed } = toastSlice.actions;
export default toastSlice.reducer;
