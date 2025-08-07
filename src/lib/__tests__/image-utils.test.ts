/**
 * Unit tests for image utility functions
 */

import { isValidCoverImage, isImageUrl, getFallbackImage, createImageErrorHandler } from '../image-utils';

describe('isValidCoverImage', () => {
  test('should return true for valid HTTP URLs', () => {
    expect(isValidCoverImage('https://example.com/image.jpg')).toBe(true);
    expect(isValidCoverImage('http://example.com/image.png')).toBe(true);
  });

  test('should return true for valid relative paths', () => {
    expect(isValidCoverImage('/images/cover.jpg')).toBe(true);
    expect(isValidCoverImage('./images/cover.png')).toBe(true);
    expect(isValidCoverImage('../images/cover.gif')).toBe(true);
  });

  test('should return false for null or undefined', () => {
    expect(isValidCoverImage(null)).toBe(false);
    expect(isValidCoverImage(undefined)).toBe(false);
  });

  test('should return false for empty strings', () => {
    expect(isValidCoverImage('')).toBe(false);
    expect(isValidCoverImage('   ')).toBe(false);
    expect(isValidCoverImage('\t\n')).toBe(false);
  });

  test('should return false for invalid URLs', () => {
    expect(isValidCoverImage('not-a-url')).toBe(false);
    expect(isValidCoverImage('just-text')).toBe(false);
  });

  test('should handle edge cases', () => {
    expect(isValidCoverImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')).toBe(true);
  });

  test('should handle malformed URLs gracefully', () => {
    expect(isValidCoverImage('http://')).toBe(false);
    expect(isValidCoverImage('https://')).toBe(false);
    expect(isValidCoverImage('ftp://example.com/image.jpg')).toBe(true);
  });

  test('should handle query parameters and fragments', () => {
    expect(isValidCoverImage('https://example.com/image.jpg?v=1')).toBe(true);
    expect(isValidCoverImage('https://example.com/image.jpg#section')).toBe(true);
    expect(isValidCoverImage('/images/cover.png?width=300&height=200')).toBe(true);
  });

  test('should handle very long URLs', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '/image.jpg';
    expect(isValidCoverImage(longUrl)).toBe(true);
  });

  test('should handle special characters in paths', () => {
    expect(isValidCoverImage('/images/图片.jpg')).toBe(true);
    expect(isValidCoverImage('/images/image with spaces.jpg')).toBe(true);
    expect(isValidCoverImage('/images/image-with-dashes.jpg')).toBe(true);
  });
});

describe('isImageUrl', () => {
  test('should return true for common image extensions', () => {
    expect(isImageUrl('image.jpg')).toBe(true);
    expect(isImageUrl('image.jpeg')).toBe(true);
    expect(isImageUrl('image.png')).toBe(true);
    expect(isImageUrl('image.gif')).toBe(true);
    expect(isImageUrl('image.webp')).toBe(true);
    expect(isImageUrl('image.svg')).toBe(true);
  });

  test('should return true for URLs with image extensions', () => {
    expect(isImageUrl('https://example.com/path/image.jpg')).toBe(true);
    expect(isImageUrl('/static/images/cover.png')).toBe(true);
  });

  test('should be case insensitive', () => {
    expect(isImageUrl('IMAGE.JPG')).toBe(true);
    expect(isImageUrl('Image.PNG')).toBe(true);
  });

  test('should return false for non-image URLs', () => {
    expect(isImageUrl('document.pdf')).toBe(false);
    expect(isImageUrl('video.mp4')).toBe(false);
    expect(isImageUrl('https://example.com')).toBe(false);
  });

  test('should handle URLs with query parameters', () => {
    expect(isImageUrl('https://example.com/image.jpg?v=1')).toBe(true);
    expect(isImageUrl('https://example.com/image.png?width=300')).toBe(true);
  });

  test('should handle edge cases', () => {
    expect(isImageUrl('')).toBe(false);
    expect(isImageUrl('image')).toBe(false);
    expect(isImageUrl('.jpg')).toBe(true);
  });
});

describe('getFallbackImage', () => {
  test('should return original image if valid', () => {
    const validImage = 'https://example.com/image.jpg';
    expect(getFallbackImage(validImage)).toBe(validImage);
  });

  test('should return fallback if original is invalid', () => {
    const fallback = 'https://example.com/fallback.jpg';
    expect(getFallbackImage('', fallback)).toBe(fallback);
    expect(getFallbackImage(null, fallback)).toBe(fallback);
  });

  test('should return null if both original and fallback are invalid', () => {
    expect(getFallbackImage('', '')).toBe(null);
    expect(getFallbackImage(null, null)).toBe(null);
  });

  test('should return null if no fallback provided and original is invalid', () => {
    expect(getFallbackImage('')).toBe(null);
    expect(getFallbackImage(null)).toBe(null);
  });

  test('should prioritize original image over fallback when both are valid', () => {
    const original = 'https://example.com/original.jpg';
    const fallback = 'https://example.com/fallback.jpg';
    expect(getFallbackImage(original, fallback)).toBe(original);
  });

  test('should handle invalid fallback images', () => {
    expect(getFallbackImage('', 'invalid-url')).toBe(null);
    expect(getFallbackImage(null, '')).toBe(null);
  });
});

describe('createImageErrorHandler', () => {
  test('should create a function that calls the provided callback', () => {
    const mockCallback = jest.fn();
    const errorHandler = createImageErrorHandler(mockCallback);
    
    errorHandler();
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('should create a function that does not throw if no callback provided', () => {
    const errorHandler = createImageErrorHandler();
    
    expect(() => errorHandler()).not.toThrow();
  });

  test('should return a function', () => {
    const errorHandler = createImageErrorHandler();
    
    expect(typeof errorHandler).toBe('function');
  });

  test('should handle multiple calls to the same error handler', () => {
    const mockCallback = jest.fn();
    const errorHandler = createImageErrorHandler(mockCallback);
    
    errorHandler();
    errorHandler();
    errorHandler();
    
    expect(mockCallback).toHaveBeenCalledTimes(3);
  });

  test('should not interfere with other error handlers', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    
    const errorHandler1 = createImageErrorHandler(mockCallback1);
    const errorHandler2 = createImageErrorHandler(mockCallback2);
    
    errorHandler1();
    errorHandler2();
    
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });
});