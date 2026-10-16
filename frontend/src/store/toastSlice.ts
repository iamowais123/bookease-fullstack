import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (
      state,
      action: PayloadAction<{
        type: 'error' | 'success' | 'info' | 'warning';
        message: string;
        title?: string;
        duration?: number;
      }>
    ) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
      state.toasts.push({
        id,
        type: action.payload.type,
        message: action.payload.message,
        title: action.payload.title,
        duration: action.payload.duration || 4500,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;

// Convenience action creators
export const showErrorToast = (message: string, title = 'Error') =>
  addToast({ type: 'error', message, title });

export const showSuccessToast = (message: string, title = 'Success') =>
  addToast({ type: 'success', message, title });

export const showInfoToast = (message: string, title = 'Notice') =>
  addToast({ type: 'info', message, title });

export default toastSlice.reducer;
