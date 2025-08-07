import { BlogPost, BlogMetadata, TableOfContents, Tag, RelatedPost } from '~/types/blog';

// 创建模拟博客文章
export const createMockBlogPost = (overrides?: Partial<BlogPost>): BlogPost => ({
  slug: 'test-article',
  title: 'Test Article: A Comprehensive Guide',
  description: 'This is a comprehensive test article that covers various aspects of testing and development practices.',
  content: `
    <h1>Test Article: A Comprehensive Guide</h1>
    <p>This is a comprehensive test article that covers various aspects of testing and development practices.</p>
    
    <h2>Introduction</h2>
    <p>Testing is a crucial part of software development that ensures code quality and reliability.</p>
    
    <h2>Best Practices</h2>
    <p>Here are some best practices for writing effective tests:</p>
    <ul>
      <li>Write clear and descriptive test names</li>
      <li>Keep tests simple and focused</li>
      <li>Use proper assertions</li>
    </ul>
    
    <h3>Unit Testing</h3>
    <p>Unit tests focus on testing individual components in isolation.</p>
    
    <h3>Integration Testing</h3>
    <p>Integration tests verify that different parts of the system work together correctly.</p>
    
    <h2>Conclusion</h2>
    <p>Effective testing leads to more reliable and maintainable software.</p>
  `,
  date: '2024-01-15',
  author: 'Test Author',
  tags: ['testing', 'development', 'best-practices'],
  category: 'Development',
  featured: false,
  draft: false,
  readingTime: 5,
  locale: 'en',
  coverImage: '/images/blog/test-cover.jpg',
  lastModified: '2024-01-15',
  ...overrides
});

// 创建模拟博客元数据
export const createMockBlogMetadata = (overrides?: Partial<BlogMetadata>): BlogMetadata => ({
  title: 'Test Article: A Comprehensive Guide',
  description: 'This is a comprehensive test article that covers various aspects of testing and development practices.',
  date: '2024-01-15',
  author: 'Test Author',
  tags: ['testing', 'development', 'best-practices'],
  category: 'Development',
  featured: false,
  draft: false,
  readingTime: 5,
  coverImage: '/images/blog/test-cover.jpg',
  ...overrides
});

// 创建模拟目录
export const createMockTableOfContents = (): TableOfContents[] => [
  {
    id: 'introduction',
    title: 'Introduction',
    level: 2
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    level: 2,
    children: [
      {
        id: 'unit-testing',
        title: 'Unit Testing',
        level: 3
      },
      {
        id: 'integration-testing',
        title: 'Integration Testing',
        level: 3
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    level: 2
  }
];

// 创建模拟标签
export const createMockTags = (): Tag[] => [
  { name: 'React', count: 15, slug: 'react' },
  { name: 'Next.js', count: 12, slug: 'nextjs' },
  { name: 'TypeScript', count: 10, slug: 'typescript' },
  { name: 'Testing', count: 8, slug: 'testing' },
  { name: 'JavaScript', count: 20, slug: 'javascript' },
  { name: 'Web Development', count: 25, slug: 'web-development' }
];

// 创建模拟相关文章
export const createMockRelatedPosts = (): RelatedPost[] => [
  {
    slug: 'related-article-1',
    title: 'Related Article 1: Advanced Testing Techniques',
    description: 'Learn advanced testing techniques for modern web applications.',
    date: '2024-01-10',
    readingTime: 7,
    tags: ['testing', 'advanced', 'web-development']
  },
  {
    slug: 'related-article-2',
    title: 'Related Article 2: Development Best Practices',
    description: 'Discover best practices for efficient software development.',
    date: '2024-01-12',
    readingTime: 6,
    tags: ['development', 'best-practices', 'productivity']
  },
  {
    slug: 'related-article-3',
    title: 'Related Article 3: Code Quality Guidelines',
    description: 'Guidelines for maintaining high code quality in your projects.',
    date: '2024-01-14',
    readingTime: 8,
    tags: ['code-quality', 'guidelines', 'development']
  }
];

// 创建模拟Markdown文件内容
export const createMockMarkdownFile = (frontmatter: BlogMetadata, content: string): string => {
  const frontmatterYaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
      }
      return `${key}: "${value}"`;
    })
    .join('\n');
  
  return `---\n${frontmatterYaml}\n---\n\n${content}`;
};

// 创建多个模拟文章
export const createMockBlogPosts = (count: number = 5): BlogPost[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockBlogPost({
      slug: `test-article-${index + 1}`,
      title: `Test Article ${index + 1}`,
      description: `This is test article number ${index + 1} for testing purposes.`,
      date: new Date(2024, 0, index + 1).toISOString().split('T')[0],
      featured: index === 0, // 第一篇文章设为精选
      tags: index % 2 === 0 ? ['testing', 'development'] : ['javascript', 'web-development']
    })
  );
};

// 创建模拟错误场景的数据
export const createInvalidBlogPost = (): Partial<BlogPost> => ({
  slug: '',
  title: '',
  description: '',
  content: '',
  date: 'invalid-date',
  author: '',
  tags: [],
  category: '',
  featured: false,
  draft: false,
  readingTime: -1,
  locale: 'invalid-locale'
});

// 创建模拟API响应
export const createMockApiResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data: success ? data : null,
  error: success ? null : 'Mock API error',
  timestamp: new Date().toISOString()
});

// 创建模拟分页数据
export const createMockPagination = (currentPage: number = 1, totalPages: number = 5) => ({
  currentPage,
  totalPages,
  hasNext: currentPage < totalPages,
  hasPrev: currentPage > 1
});

// 创建模拟搜索结果
export const createMockSearchResults = (query: string, count: number = 3): BlogPost[] => {
  return createMockBlogPosts(count).map(post => ({
    ...post,
    title: `${post.title} - ${query}`,
    description: `${post.description} This article matches your search for "${query}".`
  }));
};