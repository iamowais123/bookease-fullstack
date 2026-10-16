import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { servicesApi } from '../api/services.api.js';
import type { Service } from '../types/index.js';

interface ServicesState {
  items: Service[];
  selectedCategory: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  selectedCategory: 'all',
  isLoading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (category: string | undefined, { rejectWithValue }) => {
    try {
      const catParam = category && category !== 'all' ? category : undefined;
      const response = await servicesApi.getServices(catParam);
      return response.services;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch services');
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchServices.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServices.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchServices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSelectedCategory } = servicesSlice.actions;
export default servicesSlice.reducer;
