import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebaseApp } from '../firebase/client';

class ImageUploadService {
  private storage;

  constructor() {
    this.storage = getStorage(getFirebaseApp());
  }

  /**
   * Upload an image file to Firebase Storage
   */
  async uploadImage(
    file: File,
    path: string,
    options?: {
      maxSizeMB?: number;
      allowedTypes?: string[];
    }
  ): Promise<string> {
    try {
      // Validate file size
      const maxSizeMB = options?.maxSizeMB || 5; // 5MB default
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      // Validate file type
      const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
      }

      // Create a unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}_${randomId}.${extension}`;

      // Create storage reference
      const storageRef = ref(this.storage, `${path}/${filename}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload restaurant logo
   */
  async uploadRestaurantLogo(restaurantId: string, file: File): Promise<string> {
    return this.uploadImage(file, `restaurants/${restaurantId}/logo`, {
      maxSizeMB: 2,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
  }

  /**
   * Upload restaurant banner
   */
  async uploadRestaurantBanner(restaurantId: string, file: File): Promise<string> {
    return this.uploadImage(file, `restaurants/${restaurantId}/banner`, {
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
  }

  /**
   * Upload menu item image
   */
  async uploadMenuItemImage(restaurantId: string, menuItemId: string, file: File): Promise<string> {
    return this.uploadImage(file, `restaurants/${restaurantId}/menu-items/${menuItemId}`, {
      maxSizeMB: 3,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
  }

  /**
   * Delete an image from Firebase Storage
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // Extract the path from the download URL
      const urlParts = url.split('/o/')[1];
      if (!urlParts) {
        throw new Error('Invalid Firebase Storage URL');
      }

      const path = decodeURIComponent(urlParts.split('?')[0]);
      const imageRef = ref(this.storage, path);

      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Compress image before upload (client-side)
   */
  async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;