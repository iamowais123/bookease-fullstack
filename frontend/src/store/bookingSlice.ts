import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookingsApi, CreateBookingPayload } from '../api/bookings.api.js';
import type { Booking, Service, TimeSlot } from '../types/index.js';

interface BookingFlowState {
  isModalOpen: boolean;
  step: number; // 1: Service, 2: Date & Slot, 3: Details, 4: Confirmation
  selectedService: Service | null;
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: string | null; // HH:mm
  customerNotes: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  enableReminders: boolean;

  // Slots loading
  availableSlots: TimeSlot[];
  isLoadingSlots: boolean;
  slotsError: string | null;

  // Booking creation
  isSubmitting: boolean;
  lastCreatedBooking: Booking | null;
  submitError: string | null;

  // Customer Bookings
  myBookings: Booking[];
  isLoadingMyBookings: boolean;
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialState: BookingFlowState = {
  isModalOpen: false,
  step: 1,
  selectedService: null,
  selectedDate: getTodayString(),
  selectedSlot: null,
  customerNotes: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  enableReminders: true,

  availableSlots: [],
  isLoadingSlots: false,
  slotsError: null,

  isSubmitting: false,
  lastCreatedBooking: null,
  submitError: null,

  myBookings: [],
  isLoadingMyBookings: false,
};

export const fetchAvailableSlots = createAsyncThunk(
  'booking/fetchAvailableSlots',
  async (
    { serviceId, date }: { serviceId: string; date: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await bookingsApi.getAvailability(serviceId, date);
      return response.slots;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch slots');
    }
  }
);

export const submitBooking = createAsyncThunk(
  'booking/submitBooking',
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.createBooking(payload);
      return response.booking;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create booking');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.getMyBookings();
      return response.bookings;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch bookings');
    }
  }
);

export const cancelMyBooking = createAsyncThunk(
  'booking/cancelMyBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.cancelBooking(bookingId);
      return response.booking;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to cancel booking');
    }
  }
);

export const deleteMyBooking = createAsyncThunk(
  'booking/deleteMyBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.deleteBooking(bookingId);
      return response.bookingId || bookingId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete booking');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    openBookingModal(state, action: PayloadAction<Service | undefined>) {
      state.isModalOpen = true;
      if (action.payload) {
        state.selectedService = action.payload;
        state.step = 2; // Jump directly to date/time selection if service was preselected
      } else {
        state.step = 1;
      }
      state.submitError = null;
    },
    closeBookingModal(state) {
      state.isModalOpen = false;
      state.step = 1;
      state.selectedSlot = null;
      state.lastCreatedBooking = null;
      state.submitError = null;
    },
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    setSelectedService(state, action: PayloadAction<Service>) {
      state.selectedService = action.payload;
      state.step = 2;
      state.selectedSlot = null;
    },
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
      state.selectedSlot = null;
    },
    setSelectedSlot(state, action: PayloadAction<string>) {
      state.selectedSlot = action.payload;
    },
    setCustomerDetails(
      state,
      action: PayloadAction<{
        name?: string;
        email?: string;
        phone?: string;
        notes?: string;
        enableReminders?: boolean;
      }>
    ) {
      if (action.payload.name !== undefined) state.customerName = action.payload.name;
      if (action.payload.email !== undefined) state.customerEmail = action.payload.email;
      if (action.payload.phone !== undefined) state.customerPhone = action.payload.phone;
      if (action.payload.notes !== undefined) state.customerNotes = action.payload.notes;
      if (action.payload.enableReminders !== undefined)
        state.enableReminders = action.payload.enableReminders;
    },
    resetBookingFlow(state) {
      state.step = 1;
      state.selectedService = null;
      state.selectedSlot = null;
      state.customerNotes = '';
      state.lastCreatedBooking = null;
      state.submitError = null;
      state.isSubmitting = false;
    },
    setConfirmedBooking(state, action: PayloadAction<Booking>) {
      state.isSubmitting = false;
      state.lastCreatedBooking = action.payload;
      state.step = 4;
      state.submitError = null;
      state.myBookings.unshift(action.payload);
    },
    setSubmitting(state, action: PayloadAction<boolean>) {
      state.isSubmitting = action.payload;
    },
    setSubmitError(state, action: PayloadAction<string | null>) {
      state.submitError = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Slots
    builder.addCase(fetchAvailableSlots.pending, (state) => {
      state.isLoadingSlots = true;
      state.slotsError = null;
    });
    builder.addCase(fetchAvailableSlots.fulfilled, (state, action) => {
      state.isLoadingSlots = false;
      state.availableSlots = action.payload;
    });
    builder.addCase(fetchAvailableSlots.rejected, (state, action) => {
      state.isLoadingSlots = false;
      state.slotsError = action.payload as string;
    });

    // Create Booking
    builder.addCase(submitBooking.pending, (state) => {
      state.isSubmitting = true;
      state.submitError = null;
    });
    builder.addCase(submitBooking.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.lastCreatedBooking = action.payload;
      state.step = 4; // Confirmation screen
      state.myBookings.unshift(action.payload);
    });
    builder.addCase(submitBooking.rejected, (state, action) => {
      state.isSubmitting = false;
      state.submitError = action.payload as string;
    });

    // My Bookings
    builder.addCase(fetchMyBookings.pending, (state) => {
      state.isLoadingMyBookings = true;
    });
    builder.addCase(fetchMyBookings.fulfilled, (state, action) => {
      state.isLoadingMyBookings = false;
      state.myBookings = action.payload;
    });
    builder.addCase(fetchMyBookings.rejected, (state) => {
      state.isLoadingMyBookings = false;
    });

    // Cancel Booking
    builder.addCase(cancelMyBooking.fulfilled, (state, action) => {
      const updated = action.payload;
      state.myBookings = state.myBookings.map((b) =>
        (b._id === updated._id || b.id === updated.id) ? updated : b
      );
    });

    // Delete Booking
    builder.addCase(deleteMyBooking.fulfilled, (state, action) => {
      const deletedId = action.payload;
      state.myBookings = state.myBookings.filter(
        (b) => b._id !== deletedId && b.id !== deletedId
      );
    });
  },
});

export const {
  openBookingModal,
  closeBookingModal,
  setStep,
  setSelectedService,
  setSelectedDate,
  setSelectedSlot,
  setCustomerDetails,
  resetBookingFlow,
  setConfirmedBooking,
  setSubmitting,
  setSubmitError,
} = bookingSlice.actions;

export default bookingSlice.reducer;
