import { apiRequest } from './client.js';
import type { User } from '../types/index.js';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export const authApi = {
  async getMe(): Promise<{ user: User | null }> {
    return apiRequest<{ user: User | null }>('/auth/me');
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  async updateProfile(payload: { name?: string; phone?: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
