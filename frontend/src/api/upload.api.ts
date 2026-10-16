import { apiRequest } from './client.js';

export const uploadApi = {
  /**
   * Upload an image file to Cloudinary via backend API
   */
  async uploadImage(file: File, folder = 'bookease_salon'): Promise<{ url: string; message: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await apiRequest<{ url: string; message: string }>('/upload', {
            method: 'POST',
            body: JSON.stringify({ image: base64Data, folder }),
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
