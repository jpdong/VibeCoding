import { NextRequest } from 'next/server';
import { GET } from '~/app/api/blog/route';
import * as blogLib from '~/lib/blog';
import { createMockBlogPosts, createMockTags } from '../factories/blog.factory';

// Mock the blog library
jest.mock('~/lib/blog');
const mockBlogLib = blogLib as jest.Mocked<typeof blogLib>;

// Mock NextRequest
const createMockRequest = (searchParams: Record<string, string> = {}) => {
  const url = new URL('http://localhost:3000/api/blog');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return {
    url: url.toString(),
    method: 'GET'
  } as NextRequest;
};

describe('/api/blog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/blog', () => {
    it('returns paginated blog posts by default', async () => {
      const mockPosts = createMockBlogPosts(5);
      const mockTags = createMockTags();
      
      mockBlogLib.getBlogListResponse.mockResolvedValue({
        posts: mockPosts,
        totalCount: 10,
        hasMore: true,
        tags: mockTags,
        categories: ['Development', 'Tutorial']
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts).toHaveLength(5);
      expect(data.totalCount).toBe(10);
      expect(data.hasMore).toBe(true);
      expect(mockBlogLib.getBlogListResponse).toHaveBeenCalledWith(1, 10, 'en');
    });

    it('handles pagination parameters correctly', async () => {
      const mockPosts = createMockBlogPosts(3);
      
      mockBlogLib.getBlogListResponse.mockResolvedValue({
        posts: mockPosts,
        totalCount: 15,
        hasMore: false,
        tags: [],
        categories: []
      });

      const request = createMockRequest({ page: '3', limit: '5' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockBlogLib.getBlogListResponse).toHaveBeenCalledWith(3, 5, 'en');
    });

    it('handles locale parameter correctly', async () => {
      const mockPosts = createMockBlogPosts(2);
      
      mockBlogLib.getBlogListResponse.mockResolvedValue({
        posts: mockPosts,
        totalCount: 2,
        hasMore: false,
        tags: [],
        categories: []
      });

      const request = createMockRequest({ locale: 'zh' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockBlogLib.getBlogListResponse).toHaveBeenCalledWith(1, 10, 'zh');
    });

    it('handles search queries correctly', async () => {
      const mockSearchResults = createMockBlogPosts(2);
      
      mockBlogLib.searchBlogPosts.mockResolvedValue(mockSearchResults);

      const request = createMockRequest({ q: 'react testing' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts).toHaveLength(2);
      expect(data.totalCount).toBe(2);
      expect(data.hasMore).toBe(false);
      expect(mockBlogLib.searchBlogPosts).toHaveBeenCalledWith('react testing', 'en');
    });

    it('returns empty results for search with no matches', async () => {
      mockBlogLib.searchBlogPosts.mockResolvedValue([]);

      const request = createMockRequest({ q: 'nonexistent topic' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts).toHaveLength(0);
      expect(data.totalCount).toBe(0);
      expect(data.hasMore).toBe(false);
    });

    it('handles invalid pagination parameters gracefully', async () => {
      const mockPosts = createMockBlogPosts(5);
      
      mockBlogLib.getBlogListResponse.mockResolvedValue({
        posts: mockPosts,
        totalCount: 5,
        hasMore: false,
        tags: [],
        categories: []
      });

      const request = createMockRequest({ page: 'invalid', limit: 'also-invalid' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should default to page 1, limit 10
      expect(mockBlogLib.getBlogListResponse).toHaveBeenCalledWith(1, 10, 'en');
    });

    it('sets correct cache headers', async () => {
      mockBlogLib.getBlogListResponse.mockResolvedValue({
        posts: [],
        totalCount: 0,
        hasMore: false,
        tags: [],
        categories: []
      });

      const request = createMockRequest();
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe(
        'public, s-maxage=300, stale-while-revalidate=600'
      );
    });

    it('handles errors gracefully', async () => {
      mockBlogLib.getBlogListResponse.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch blog posts');
    });

    it('handles search errors gracefully', async () => {
      mockBlogLib.searchBlogPosts.mockRejectedValue(new Error('Search service error'));

      const request = createMockRequest({ q: 'test query' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch blog posts');
    });

    it('validates and sanitizes input parameters', async () => {
      mockBlogLib.getBlogListResponse.mockResolvedValue({
        posts: [],
        totalCount: 0,
        hasMore: false,
        tags: [],
        categories: []
      });

      // Test with extreme values
      const request = createMockRequest({ page: '999999', limit: '1000' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should handle large numbers appropriately
      expect(mockBlogLib.getBlogListResponse).toHaveBeenCalledWith(999999, 1000, 'en');
    });

    it('handles empty search query', async () => {
      const mockPosts = createMockBlogPosts(5);
      
      mockBlogLib.getBlogListResponse.mockResolvedValue({
        posts: mockPosts,
        totalCount: 5,
        hasMore: false,
        tags: [],
        categories: []
      });

      const request = createMockRequest({ q: '' });
      const response = await GET(request);

      // Empty query should fall back to regular listing
      expect(mockBlogLib.getBlogListResponse).toHaveBeenCalled();
      expect(mockBlogLib.searchBlogPosts).not.toHaveBeenCalled();
    });
  });
});