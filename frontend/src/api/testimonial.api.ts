import { apiRequest } from './client.js';

export interface TestimonialItem {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  service: string;
  avatar?: string;
  isFeatured: boolean;
  createdAt: string;
}

export const testimonialApi = {
  // Public
  async getTestimonials(): Promise<TestimonialItem[]> {
    return apiRequest<TestimonialItem[]>('/testimonials');
  },

  // Admin
  async getAllTestimonialsAdmin(): Promise<TestimonialItem[]> {
    return apiRequest<TestimonialItem[]>('/testimonials/admin/all');
  },

  async createTestimonial(data: {
    name: string;
    comment: string;
    rating: number;
    service: string;
    avatar?: string;
  }): Promise<{ message: string; testimonial: TestimonialItem }> {
    return apiRequest<{ message: string; testimonial: TestimonialItem }>('/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTestimonial(
    id: string,
    data: Partial<TestimonialItem>
  ): Promise<{ message: string; testimonial: TestimonialItem }> {
    return apiRequest<{ message: string; testimonial: TestimonialItem }>(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTestimonial(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/testimonials/${id}`, {
      method: 'DELETE',
    });
  },
};
