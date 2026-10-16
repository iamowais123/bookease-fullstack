import { apiRequest } from './client.js';
import type { Booking, AvailabilityResponse } from '../types/index.js';

export interface CreateBookingPayload {
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  bookingId: string;
  isSimulated?: boolean;
  serviceName?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface VerifyPaymentPayload {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const bookingsApi = {
  async getAvailability(serviceId: string, date: string): Promise<AvailabilityResponse> {
    return apiRequest<AvailabilityResponse>('/bookings/availability', {
      params: { serviceId, date },
    });
  },

  async createBooking(payload: CreateBookingPayload): Promise<{ booking: Booking; message: string }> {
    return apiRequest<{ booking: Booking; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createRazorpayOrder(payload: CreateBookingPayload): Promise<RazorpayOrderResponse> {
    return apiRequest<RazorpayOrderResponse>('/bookings/razorpay-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyRazorpayPayment(payload: VerifyPaymentPayload): Promise<{ booking: Booking; message: string }> {
    return apiRequest<{ booking: Booking; message: string }>('/bookings/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyBookings(): Promise<{ bookings: Booking[] }> {
    return apiRequest<{ bookings: Booking[] }>('/bookings/my');
  },

  async getBookingById(id: string): Promise<{ booking: Booking }> {
    return apiRequest<{ booking: Booking }>(`/bookings/${id}`);
  },

  async cancelBooking(id: string): Promise<{ booking: Booking; message: string }> {
    return apiRequest<{ booking: Booking; message: string }>(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  },

  async deleteBooking(id: string): Promise<{ bookingId: string; message: string }> {
    return apiRequest<{ bookingId: string; message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};
