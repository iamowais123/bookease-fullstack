import { apiRequest } from './client.js';

export interface Expert {
  _id: string;
  name: string;
  role: string;
  experience: string;
  specialty: string;
  rating: number;
  image: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateExpertPayload {
  name: string;
  role: string;
  experience: string;
  specialty: string;
  rating: number;
  image: string;
  bio?: string;
}

export const expertApi = {
  async getExperts(): Promise<Expert[]> {
    return apiRequest<Expert[]>('/experts');
  },

  async getAllExpertsAdmin(): Promise<Expert[]> {
    return apiRequest<Expert[]>('/experts/admin/all');
  },

  async createExpert(payload: CreateExpertPayload): Promise<{ message: string; expert: Expert }> {
    return apiRequest<{ message: string; expert: Expert }>('/experts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateExpert(id: string, payload: Partial<CreateExpertPayload & { isActive: boolean }>): Promise<{ message: string; expert: Expert }> {
    return apiRequest<{ message: string; expert: Expert }>(`/experts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteExpert(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/experts/${id}`, {
      method: 'DELETE',
    });
  },
};
