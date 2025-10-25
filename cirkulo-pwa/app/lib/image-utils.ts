/**
 * Image Utilities
 *
 * Helper functions for image processing, optimization, and validation
 */

/**
 * Resize an image file to fit within maximum dimensions while maintaining aspect ratio
 *
 * @param file - Original image file
 * @param maxWidth - Maximum width in pixels (default: 2048)
 * @param maxHeight - Maximum height in pixels (default: 2048)
 * @param quality - JPEG quality (0-1, default: 0.9)
 * @returns Promise resolving to resized File
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 2048,
  maxHeight: number = 2048,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create image blob"));
            return;
          }

          // Create new File from blob
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create a preview URL for an image file
 *
 * @param file - Image file to preview
 * @returns Object URL that can be used as img src
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke an image preview URL to free memory
 *
 * @param url - Object URL to revoke
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validate image file type
 *
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if valid, false otherwise
 */
export function isValidImageType(
  file: File,
  allowedTypes: string[] = ["image/png", "image/jpeg", "image/webp"]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate image file size
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @returns true if valid, false otherwise
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Optimize image for upload
 * - Resizes if too large
 * - Converts to optimal format if needed
 *
 * @param file - Original image file
 * @returns Promise resolving to optimized File
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  // Check if image is already small enough
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (file.size <= maxSize) {
    return file;
  }

  // Resize to reduce file size
  return resizeImage(file, 2048, 2048, 0.85);
}
