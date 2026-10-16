import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminApi, CreateServicePayload } from '../api/admin.api.js';
import { bookingsApi } from '../api/bookings.api.js';
import type { AdminDashboardData, Booking, Service, BookingStatus } from '../types/index.js';

interface AdminState {
  dashboard: AdminDashboardData | null;
  bookings: Booking[];
  services: Service[];
  customers: any[];

  // View controls
  viewMode: 'calendar' | 'list';
  statusFilter: string;
  searchQuery: string;
  autoRemindersEnabled: boolean;
  selectedMonth: {
    year: number;
    month: number; // 0-11
  };

  // Loading states
  isLoadingDashboard: boolean;
  isLoadingBookings: boolean;
  isLoadingServices: boolean;
  isActionInProgress: boolean;
  error: string | null;
}

const currentDate = new Date();

const initialState: AdminState = {
  dashboard: null,
  bookings: [],
  services: [],
  customers: [],

  viewMode: 'calendar',
  statusFilter: 'all',
  searchQuery: '',
  autoRemindersEnabled: true,
  selectedMonth: {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
  },

  isLoadingDashboard: false,
  isLoadingBookings: false,
  isLoadingServices: false,
  isActionInProgress: false,
  error: null,
};

export const fetchAdminDashboard = createAsyncThunk(
  'admin/fetchAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminApi.getDashboard();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard metrics');
    }
  }
);

export const fetchAdminBookings = createAsyncThunk(
  'admin/fetchAdminBookings',
  async (
    params: { status?: string; search?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const queryParams: any = {};
      if (params?.status && params.status !== 'all') {
        queryParams.status = params.status;
      }
      if (params?.search) {
        queryParams.search = params.search;
      }
      queryParams.limit = 100;
      const response = await adminApi.getBookings(queryParams);
      return response.bookings;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch bookings');
    }
  }
);

export const updateBookingStatusAdmin = createAsyncThunk(
  'admin/updateBookingStatusAdmin',
  async (
    { id, status }: { id: string; status: BookingStatus },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await adminApi.updateBookingStatus(id, status);
      // Refresh dashboard metrics
      dispatch(fetchAdminDashboard());
      return response.booking;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update booking status');
    }
  }
);

export const deleteBookingAdmin = createAsyncThunk(
  'admin/deleteBookingAdmin',
  async (bookingId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await bookingsApi.deleteBooking(bookingId);
      dispatch(fetchAdminDashboard());
      return response.bookingId || bookingId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete booking');
    }
  }
);

export const fetchAdminServices = createAsyncThunk(
  'admin/fetchAdminServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getServices();
      return response.services;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch services');
    }
  }
);

export const createServiceAdmin = createAsyncThunk(
  'admin/createServiceAdmin',
  async (payload: CreateServicePayload, { rejectWithValue }) => {
    try {
      const response = await adminApi.createService(payload);
      return response.service;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create service');
    }
  }
);

export const updateServiceAdmin = createAsyncThunk(
  'admin/updateServiceAdmin',
  async (
    { id, payload }: { id: string; payload: Partial<CreateServicePayload> },
    { rejectWithValue }
  ) => {
    try {
      const response = await adminApi.updateService(id, payload);
      return response.service;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update service');
    }
  }
);

export const deleteServiceAdmin = createAsyncThunk(
  'admin/deleteServiceAdmin',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminApi.deleteService(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete service');
    }
  }
);

export const fetchCustomersAdmin = createAsyncThunk(
  'admin/fetchCustomersAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getCustomers();
      return response.customers;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch customers');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<'calendar' | 'list'>) {
      state.viewMode = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    toggleAutoReminders(state) {
      state.autoRemindersEnabled = !state.autoRemindersEnabled;
    },
    nextMonth(state) {
      if (state.selectedMonth.month === 11) {
        state.selectedMonth.year += 1;
        state.selectedMonth.month = 0;
      } else {
        state.selectedMonth.month += 1;
      }
    },
    prevMonth(state) {
      if (state.selectedMonth.month === 0) {
        state.selectedMonth.year -= 1;
        state.selectedMonth.month = 11;
      } else {
        state.selectedMonth.month -= 1;
      }
    },
    setMonth(state, action: PayloadAction<{ year: number; month: number }>) {
      state.selectedMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder.addCase(fetchAdminDashboard.pending, (state) => {
      state.isLoadingDashboard = true;
    });
    builder.addCase(fetchAdminDashboard.fulfilled, (state, action) => {
      state.isLoadingDashboard = false;
      state.dashboard = action.payload;
    });
    builder.addCase(fetchAdminDashboard.rejected, (state, action) => {
      state.isLoadingDashboard = false;
      state.error = action.payload as string;
    });

    // Bookings
    builder.addCase(fetchAdminBookings.pending, (state) => {
      state.isLoadingBookings = true;
    });
    builder.addCase(fetchAdminBookings.fulfilled, (state, action) => {
      state.isLoadingBookings = false;
      state.bookings = action.payload;
    });
    builder.addCase(fetchAdminBookings.rejected, (state) => {
      state.isLoadingBookings = false;
    });

    // Update booking status
    builder.addCase(updateBookingStatusAdmin.fulfilled, (state, action) => {
      const updated = action.payload;
      state.bookings = state.bookings.map((b) =>
        (b._id === updated._id || b.id === updated.id) ? updated : b
      );
    });

    // Delete booking admin
    builder.addCase(deleteBookingAdmin.fulfilled, (state, action) => {
      const deletedId = action.payload;
      state.bookings = state.bookings.filter(
        (b) => b._id !== deletedId && b.id !== deletedId
      );
      if (state.dashboard?.recentBookings) {
        state.dashboard.recentBookings = state.dashboard.recentBookings.filter(
          (b) => b._id !== deletedId && b.id !== deletedId
        );
      }
    });

    // Services
    builder.addCase(fetchAdminServices.pending, (state) => {
      state.isLoadingServices = true;
    });
    builder.addCase(fetchAdminServices.fulfilled, (state, action) => {
      state.isLoadingServices = false;
      state.services = action.payload;
    });
    builder.addCase(fetchAdminServices.rejected, (state) => {
      state.isLoadingServices = false;
    });

    // Create service
    builder.addCase(createServiceAdmin.fulfilled, (state, action) => {
      state.services.push(action.payload);
    });

    // Update service
    builder.addCase(updateServiceAdmin.fulfilled, (state, action) => {
      state.services = state.services.map((s) =>
        (s._id === action.payload._id || s.id === action.payload.id) ? action.payload : s
      );
    });

    // Delete service
    builder.addCase(deleteServiceAdmin.fulfilled, (state, action) => {
      state.services = state.services.filter(
        (s) => s._id !== action.payload && s.id !== action.payload
      );
    });

    // Customers
    builder.addCase(fetchCustomersAdmin.fulfilled, (state, action) => {
      state.customers = action.payload;
    });
  },
});

export const {
  setViewMode,
  setStatusFilter,
  setSearchQuery,
  toggleAutoReminders,
  nextMonth,
  prevMonth,
  setMonth,
} = adminSlice.actions;

export default adminSlice.reducer;
