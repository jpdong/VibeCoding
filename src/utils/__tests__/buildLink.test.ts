/**
 * Tests for buildLink utility function
 */

import { getLinkHref } from '../buildLink';

describe('getLinkHref', () => {
  test('should generate correct blog URLs for different locales', () => {
    // English locale doesn't include locale prefix
    expect(getLinkHref('en', 'blog')).toBe('/blog');
    expect(getLinkHref('zh', 'blog')).toBe('/zh/blog');
  });

  test('should handle empty page parameter', () => {
    // English locale returns root path
    expect(getLinkHref('en', '')).toBe('/');
    expect(getLinkHref('zh', '')).toBe('/zh/');
  });

  test('should handle nested blog paths', () => {
    expect(getLinkHref('en', 'blog/my-post')).toBe('/blog/my-post');
    expect(getLinkHref('zh', 'blog/my-post')).toBe('/zh/blog/my-post');
  });

  test('should handle other locales', () => {
    expect(getLinkHref('fr', 'blog')).toBe('/fr/blog');
    expect(getLinkHref('de', 'blog')).toBe('/de/blog');
  });

  test('should handle special characters in page paths', () => {
    expect(getLinkHref('en', 'blog/post-with-dashes')).toBe('/blog/post-with-dashes');
    expect(getLinkHref('zh', 'blog/中文标题')).toBe('/zh/blog/中文标题');
  });

  test('should handle undefined parameters', () => {
    expect(getLinkHref()).toBe('/');
    expect(getLinkHref('zh')).toBe('/zh/');
  });
});