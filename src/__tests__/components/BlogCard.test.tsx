import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BlogCard from '~/components/blog/BlogCard';
import { createMockBlogPost } from '../factories/blog.factory';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('BlogCard', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    jest.clearAllMocks();
  });

  it('renders blog post information correctly', () => {
    const mockPost = createMockBlogPost({
      title: 'Test Blog Post',
      description: 'This is a test blog post description',
      author: 'John Doe',
      date: '2024-01-15',
      readingTime: 5,
      tags: ['React', 'Testing']
    });

    render(<BlogCard post={mockPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
    expect(screen.getByText('This is a test blog post description')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('displays featured badge for featured posts', () => {
    const featuredPost = createMockBlogPost({ featured: true });
    render(<BlogCard post={featuredPost} />);
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('does not display featured badge for non-featured posts', () => {
    const regularPost = createMockBlogPost({ featured: false });
    render(<BlogCard post={regularPost} />);
    
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('renders cover image when provided', () => {
    const postWithImage = createMockBlogPost({
      coverImage: '/test-image.jpg',
      title: 'Post with Image'
    });
    
    render(<BlogCard post={postWithImage} />);
    
    const image = screen.getByAltText('Post with Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('does not render image section when no cover image', () => {
    const postWithoutImage = createMockBlogPost({ coverImage: undefined });
    render(<BlogCard post={postWithoutImage} />);
    
    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });

  it('formats date correctly for different locales', () => {
    const post = createMockBlogPost({
      date: '2024-01-15',
      locale: 'en'
    });
    
    render(<BlogCard post={post} />);
    
    // Check if date is formatted (exact format may vary by system locale)
    expect(screen.getByText(/January|Jan/)).toBeInTheDocument();
  });

  it('limits displayed tags to 3 and shows count for additional tags', () => {
    const postWithManyTags = createMockBlogPost({
      tags: ['React', 'Next.js', 'TypeScript', 'Testing', 'JavaScript']
    });
    
    render(<BlogCard post={postWithManyTags} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('Testing')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const post = createMockBlogPost();
    
    const { rerender } = render(<BlogCard post={post} size="small" />);
    expect(screen.getByRole('article')).toHaveClass('p-4');
    
    rerender(<BlogCard post={post} size="medium" />);
    expect(screen.getByRole('article')).toHaveClass('p-6');
    
    rerender(<BlogCard post={post} size="large" />);
    expect(screen.getByRole('article')).toHaveClass('p-8');
  });

  it('shows or hides excerpt based on showExcerpt prop', () => {
    const post = createMockBlogPost({
      description: 'This is the post description'
    });
    
    const { rerender } = render(<BlogCard post={post} showExcerpt={true} />);
    expect(screen.getByText('This is the post description')).toBeInTheDocument();
    
    rerender(<BlogCard post={post} showExcerpt={false} />);
    expect(screen.queryByText('This is the post description')).not.toBeInTheDocument();
  });

  it('has correct link href', () => {
    const post = createMockBlogPost({
      slug: 'test-post',
      locale: 'en'
    });
    
    render(<BlogCard post={post} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/blog/test-post');
  });

  it('applies hover effects correctly', () => {
    const post = createMockBlogPost();
    render(<BlogCard post={post} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('hover:shadow-xl', 'hover:-translate-y-1', 'hover:scale-[1.02]');
  });

  it('handles missing optional fields gracefully', () => {
    const minimalPost = createMockBlogPost({
      coverImage: undefined,
      tags: [],
      description: ''
    });
    
    expect(() => render(<BlogCard post={minimalPost} />)).not.toThrow();
  });

  it('renders author avatar with correct initial', () => {
    const post = createMockBlogPost({ author: 'Jane Smith' });
    render(<BlogCard post={post} />);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const post = createMockBlogPost();
    render(<BlogCard post={post} />);
    
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });
});