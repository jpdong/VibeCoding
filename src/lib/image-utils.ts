/**
 * Image utility functions for blog components
 */

/**
 * Validates if a cover image URL is valid and should be displayed
 * @param coverImage - The cover image URL to validate
 * @returns boolean - true if the image should be displayed, false otherwise
 */
export function isValidCoverImage(coverImage?: string | null): boolean {
  // Check if coverImage exists and is not null/undefined
  if (!coverImage) {
    return false;
  }
  
  // Check if coverImage is not an empty string or only whitespace
  const trimmedImage = coverImage.trim();
  if (trimmedImage === '') {
    return false;
  }
  
  // Basic URL validation - check if it looks like a valid URL
  try {
    new URL(trimmedImage);
    return true;
  } catch {
    // If it's not a valid URL, check if it's a relative path
    return trimmedImage.startsWith('/') || trimmedImage.startsWith('./') || trimmedImage.startsWith('../');
  }
}

/**
 * Checks if an image URL appears to be a valid image file
 * @param imageUrl - The image URL to check
 * @returns boolean - true if the URL appears to be an image file
 */
export function isImageUrl(imageUrl: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const lowercaseUrl = imageUrl.toLowerCase();
  
  return imageExtensions.some(ext => lowercaseUrl.includes(ext));
}

/**
 * Gets a fallback image URL if the provided image is invalid
 * @param coverImage - The original cover image URL
 * @param fallbackImage - Optional fallback image URL
 * @returns string | null - The fallback image URL or null if no fallback
 */
export function getFallbackImage(coverImage?: string | null, fallbackImage?: string): string | null {
  if (isValidCoverImage(coverImage)) {
    return coverImage!;
  }
  
  if (fallbackImage && isValidCoverImage(fallbackImage)) {
    return fallbackImage;
  }
  
  return null;
}

/**
 * Image loading error handler type
 */
export type ImageErrorHandler = () => void;

/**
 * Creates an image error handler that can be used with Next.js Image components
 * @param onError - Callback function to execute when image fails to load
 * @returns ImageErrorHandler - Error handler function
 */
export function createImageErrorHandler(onError?: () => void): ImageErrorHandler {
  return () => {
    if (onError) {
      onError();
    }
  };
}