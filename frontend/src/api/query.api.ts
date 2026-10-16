import { apiRequest } from './client.js';

export interface SubmitQueryPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface CustomerQuery {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}

export const queryApi = {
  async submitQuery(payload: SubmitQueryPayload): Promise<{ message: string; query: CustomerQuery }> {
    return apiRequest<{ message: string; query: CustomerQuery }>('/queries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAllQueries(): Promise<CustomerQuery[]> {
    return apiRequest<CustomerQuery[]>('/queries');
  },

  async updateQueryStatus(
    id: string,
    status: 'new' | 'read' | 'replied'
  ): Promise<{ message: string; query: CustomerQuery }> {
    return apiRequest<{ message: string; query: CustomerQuery }>(`/queries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteQuery(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/queries/${id}`, {
      method: 'DELETE',
    });
  },
};
