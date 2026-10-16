export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Service {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  duration: number; // in minutes
  price: number;
  currency: string;
  imageUrl?: string;
  isActive: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Booking {
  _id: string;
  id?: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string;
  service: Service | string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  totalPrice: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  serviceId: string;
  duration: number;
  slots: TimeSlot[];
}

export interface DashboardMetrics {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  currency: string;
}

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  recentBookings: Booking[];
  statusBreakdown: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}
