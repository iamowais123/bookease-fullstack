import { apiRequest } from './client.js';

export interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const galleryApi = {
  // Public
  async getGallery(): Promise<GalleryItem[]> {
    return apiRequest<GalleryItem[]>('/gallery');
  },

  // Admin
  async createGalleryItem(data: {
    title: string;
    category: string;
    image: string;
    description?: string;
  }): Promise<{ message: string; item: GalleryItem }> {
    return apiRequest<{ message: string; item: GalleryItem }>('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteGalleryItem(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/gallery/${id}`, {
      method: 'DELETE',
    });
  },
};
