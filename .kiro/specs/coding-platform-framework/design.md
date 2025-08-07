# Design Document

## Overview

本设计文档描述了在现有Next.js代码生成工具网站基础上，添加Blog模块的技术方案。Blog模块将支持从Markdown文件自动生成高质量的博客页面，采用世界顶级的交互设计，简洁而专业。项目基于Next.js 14 + TypeScript + Tailwind CSS技术栈，支持国际化（中英文），新功能将与现有代码生成工具无缝集成。

## Architecture

### 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Code Gen      │  │   Blog Module   │  │   Markdown      │ │
│  │   (Existing)    │  │   (New)         │  │   Processing    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Static Generation                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Markdown      │  │   Blog Pages    │  │   RSS/Sitemap   │ │
│  │   Files         │  │   Generation    │  │   Generation    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 路由架构
基于现有的国际化路由结构，新增Blog相关路由：

```
/                           # 首页 - 代码生成工具 (现有)
/[locale]/                  # 国际化首页 (现有)
/[locale]/blog              # Blog主页 (新增)
/[locale]/blog/[slug]       # 博客文章页面 (新增)
/api/blog                   # Blog API (新增)
/rss.xml                    # RSS Feed (新增)
```

### Markdown文件结构
```
/content/
  /blog/
    /en/
      - getting-started.md
      - advanced-tips.md
    /zh/
      - getting-started.md
      - advanced-tips.md
```

## Components and Interfaces

### 新增核心组件

#### 1. Blog主页组件
```typescript
// BlogList.tsx
interface BlogListProps {
  posts: BlogPost[];
  locale: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// BlogCard.tsx
interface BlogCardProps {
  post: BlogPost;
  size?: 'small' | 'medium' | 'large';
  showExcerpt?: boolean;
}

// BlogHero.tsx
interface BlogHeroProps {
  featuredPost?: BlogPost;
  recentPosts: BlogPost[];
}
```

#### 2. 博客文章组件
```typescript
// BlogPost.tsx
interface BlogPostProps {
  post: BlogPost;
  content: string;
  relatedPosts: BlogPost[];
}

// BlogContent.tsx
interface BlogContentProps {
  content: string;
  toc?: TableOfContents[];
}

// ReadingProgress.tsx
interface ReadingProgressProps {
  target: string;
}

// TableOfContents.tsx
interface TableOfContentsProps {
  headings: TableOfContents[];
  activeId?: string;
}
```

#### 3. 交互增强组件
```typescript
// ShareButtons.tsx
interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

// RelatedPosts.tsx
interface RelatedPostsProps {
  posts: BlogPost[];
  currentPostId: string;
}

// TagCloud.tsx
interface TagCloudProps {
  tags: Tag[];
  selectedTags?: string[];
  onTagClick?: (tag: string) => void;
}
```

### 导航集成
修改现有Header组件，添加Blog导航入口：

```typescript
// 在现有Header.tsx中添加
const navigationItems = [
  { href: '/', label: 'Code Generator' },
  { href: '/blog', label: 'Blog' }, // 新增
  // 其他导航项...
];
```

## Data Models

### Blog数据模型

#### Markdown Frontmatter结构
```yaml
---
title: "文章标题"
description: "文章描述/摘要"
date: "2024-01-15"
author: "作者名称"
tags: ["JavaScript", "React", "Tutorial"]
category: "Development"
featured: true
draft: false
readingTime: 8
coverImage: "/images/blog/cover.jpg"
---
```

#### TypeScript接口定义

```typescript
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  featured: boolean;
  draft: boolean;
  readingTime: number;
  coverImage?: string;
  locale: string;
  lastModified?: string;
}

interface BlogMetadata {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  featured?: boolean;
  draft?: boolean;
  readingTime?: number;
  coverImage?: string;
}

interface TableOfContents {
  id: string;
  title: string;
  level: number;
  children?: TableOfContents[];
}

interface Tag {
  name: string;
  count: number;
  slug: string;
}

interface BlogListResponse {
  posts: BlogPost[];
  totalCount: number;
  hasMore: boolean;
  tags: Tag[];
  categories: string[];
}

interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  tags: string[];
}
```

### 文件系统结构
```
/content/
  /blog/
    /en/
      - 2024-01-15-getting-started.md
      - 2024-01-20-advanced-tips.md
      - 2024-02-01-best-practices.md
    /zh/
      - 2024-01-15-getting-started.md
      - 2024-01-20-advanced-tips.md
      - 2024-02-01-best-practices.md
  /images/
    /blog/
      - cover-image-1.jpg
      - cover-image-2.jpg
```

## Error Handling

### Markdown处理错误
1. **文件读取错误**: 优雅处理文件不存在或权限问题
2. **Frontmatter解析错误**: 提供默认值和错误日志
3. **Markdown渲染错误**: 显示原始内容并记录错误
4. **图片加载错误**: 提供占位符和重试机制

### 页面错误处理
1. **404错误**: 自定义404页面，提供相关文章推荐
2. **构建时错误**: 跳过有问题的文章，记录错误日志
3. **客户端错误**: 错误边界组件捕获并显示友好信息
4. **网络错误**: 离线提示和缓存内容显示

```typescript
// Markdown处理错误类
class MarkdownError extends Error {
  constructor(
    public filePath: string,
    public message: string,
    public originalError?: Error
  ) {
    super(`Markdown Error in ${filePath}: ${message}`);
  }
}

// 错误边界组件
export class BlogErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but there was an error loading this content.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### 单元测试
- **组件测试**: 使用Jest + React Testing Library测试所有Blog组件
- **Markdown处理测试**: 测试frontmatter解析和内容渲染
- **工具函数测试**: 测试文章排序、过滤、搜索等核心逻辑

### 集成测试
- **页面渲染测试**: 确保Blog页面正确渲染和数据加载
- **导航测试**: 测试从首页到Blog的导航流程
- **静态生成测试**: 测试Markdown文件到静态页面的生成过程

### E2E测试
- **阅读流程测试**: 从Blog列表到文章详情的完整用户旅程
- **响应式测试**: 测试在不同设备上的显示效果
- **性能测试**: 测试页面加载速度和交互响应

### 内容测试
- **Markdown渲染测试**: 确保各种Markdown语法正确渲染
- **图片加载测试**: 测试文章中图片的加载和优化
- **链接有效性测试**: 检查文章中的内外部链接

### 测试数据准备
```typescript
// 测试数据工厂
export const createMockBlogPost = (overrides?: Partial<BlogPost>): BlogPost => ({
  slug: 'test-article',
  title: 'Test Article',
  description: 'This is a test article for development',
  content: '# Test Content\n\nThis is test content...',
  date: '2024-01-15',
  author: 'Test Author',
  tags: ['test', 'development'],
  category: 'Development',
  featured: false,
  draft: false,
  readingTime: 5,
  locale: 'en',
  ...overrides
});

export const createMockMarkdownFile = (frontmatter: BlogMetadata, content: string) => {
  const frontmatterYaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
  
  return `---\n${frontmatterYaml}\n---\n\n${content}`;
};
```

## 世界顶级交互设计

### 视觉设计原则
1. **简洁性**: 采用极简主义设计，突出内容本身
2. **专业性**: 使用一致的设计系统和高质量的排版
3. **可读性**: 优化字体、行距、对比度，提供最佳阅读体验
4. **响应式**: 完美适配所有设备，从手机到大屏显示器

### 交互设计特性
```typescript
// 动画和过渡效果配置
export const animations = {
  // 页面进入动画
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  
  // 卡片悬停效果
  cardHover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // 阅读进度条
  readingProgress: {
    scaleX: 0,
    transformOrigin: 'left',
    transition: { duration: 0.1, ease: 'linear' }
  }
};

// 设计系统配置
export const designSystem = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      600: '#4b5563',
      900: '#111827'
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    
    fontSize: {
      'blog-title': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      'blog-subtitle': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],
      'blog-body': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }]
    }
  },
  
  spacing: {
    'blog-section': '4rem',
    'blog-paragraph': '1.5rem',
    'blog-margin': '2rem'
  }
};
```

### 用户体验增强
1. **阅读进度指示**: 顶部进度条显示阅读进度
2. **目录导航**: 智能目录，自动高亮当前章节
3. **平滑滚动**: 所有导航和锚点链接使用平滑滚动
4. **懒加载**: 图片和内容的智能懒加载
5. **暗色模式**: 支持系统级暗色模式切换

### SEO和性能优化

#### SEO优化
1. **动态元数据**: 为每篇文章生成独特的SEO信息
2. **结构化数据**: 添加Article Schema标记
3. **Open Graph**: 完整的社交媒体分享优化
4. **内部链接**: 智能的相关文章推荐

#### 性能优化
1. **静态生成**: 所有Blog页面在构建时预生成
2. **图片优化**: 自动WebP转换和响应式图片
3. **代码分割**: 按需加载组件和资源
4. **CDN优化**: 静态资源CDN分发

```typescript
// SEO元数据生成
export function generateBlogMetadata(post: BlogPost): Metadata {
  return {
    title: `${post.title} | Vibe Coding Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.coverImage ? [{
        url: post.coverImage,
        width: 1200,
        height: 630,
        alt: post.title
      }] : []
    },
    
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : []
    },
    
    alternates: {
      canonical: `/blog/${post.slug}`
    }
  };
}

// 结构化数据生成
export function generateArticleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author
    },
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(' ').length,
    timeRequired: `PT${post.readingTime}M`,
    image: post.coverImage ? {
      '@type': 'ImageObject',
      url: post.coverImage,
      width: 1200,
      height: 630
    } : undefined
  };
}
```