import { apiRequest } from './client.js';
import type { AdminDashboardData, Booking, Service, BookingStatus } from '../types/index.js';

export interface AdminBookingsQuery {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateServicePayload {
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  currency?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export const adminApi = {
  async getDashboard(): Promise<AdminDashboardData> {
    return apiRequest<AdminDashboardData>('/admin/dashboard');
  },

  async getBookings(query: AdminBookingsQuery = {}): Promise<{
    bookings: Booking[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return apiRequest('/admin/bookings', { params: query as any });
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<{ booking: Booking; message: string }> {
    return apiRequest<{ booking: Booking; message: string }>(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getServices(): Promise<{ services: Service[] }> {
    return apiRequest<{ services: Service[] }>('/admin/services');
  },

  async createService(payload: CreateServicePayload): Promise<{ service: Service; message: string }> {
    return apiRequest<{ service: Service; message: string }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateService(
    id: string,
    payload: Partial<CreateServicePayload>
  ): Promise<{ service: Service; message: string }> {
    return apiRequest<{ service: Service; message: string }>(`/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteService(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/admin/services/${id}`, {
      method: 'DELETE',
    });
  },

  async getCustomers(): Promise<{
    customers: Array<{
      _id: string;
      name: string;
      email: string;
      phone?: string;
      createdAt: string;
      bookingCount: number;
    }>;
  }> {
    return apiRequest('/admin/customers');
  },
};
