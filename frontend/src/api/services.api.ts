import { apiRequest } from './client.js';
import type { Service } from '../types/index.js';

export const servicesApi = {
  async getServices(category?: string): Promise<{ services: Service[] }> {
    return apiRequest<{ services: Service[] }>('/services', {
      params: category ? { category } : undefined,
    });
  },

  async getServiceBySlug(slug: string): Promise<{ service: Service }> {
    return apiRequest<{ service: Service }>(`/services/${slug}`);
  },
};
