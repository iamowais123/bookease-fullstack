import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice.js';
import servicesReducer from './servicesSlice.js';
import bookingReducer from './bookingSlice.js';
import adminReducer from './adminSlice.js';
import toastReducer from './toastSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    booking: bookingReducer,
    admin: adminReducer,
    toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
