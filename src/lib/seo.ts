import { Metadata } from 'next';
import { BlogPost } from '~/types/blog';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com';
const siteName = 'Vibe Coding';

// 生成博客文章的SEO元数据
export function generateBlogMetadata(post: BlogPost): Metadata {
  // 英文版本不显示 /en 前缀
  const postUrl = post.locale === 'en' 
    ? `${siteUrl}/blog/${post.slug}`
    : `${siteUrl}/${post.locale}/blog/${post.slug}`;
  
  return {
    title: `${post.title} | ${siteName} Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastModified || post.date,
      authors: [post.author],
      tags: post.tags,
      locale: post.locale === 'zh' ? 'zh_CN' : 'en_US',
      siteName,
      images: (post.coverImage && post.coverImage.trim()) ? [{
        url: post.coverImage,
        width: 1200,
        height: 630,
        alt: post.title,
        type: 'image/jpeg'
      }] : [{
        url: `${siteUrl}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: post.title,
        type: 'image/jpeg'
      }]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      creator: '@vibecoding',
      site: '@vibecoding',
      images: (post.coverImage && post.coverImage.trim()) ? [post.coverImage] : [`${siteUrl}/og-default.jpg`]
    },
    
    alternates: {
      canonical: postUrl,
      languages: {
        'en': `/blog/${post.slug}`,
        'zh': `/zh/blog/${post.slug}`
      }
    },

    other: {
      'article:published_time': post.date,
      'article:modified_time': post.lastModified || post.date,
      'article:author': post.author,
      'article:section': post.category,
      'article:tag': post.tags.join(',')
    }
  };
}

// 生成博客列表页的SEO元数据
export function generateBlogListMetadata(locale: string, tag?: string, category?: string): Metadata {
  const isZh = locale === 'zh';
  
  let title = isZh ? `${siteName} 博客` : `${siteName} Blog`;
  let description = isZh 
    ? '探索最新的Web开发技术、编程教程和最佳实践。学习React、Next.js、TypeScript等现代开发技术。'
    : 'Explore the latest web development technologies, programming tutorials, and best practices. Learn React, Next.js, TypeScript, and modern development techniques.';
  
  if (tag) {
    title = isZh ? `标签"${tag}"的文章 | ${siteName}` : `Posts tagged "${tag}" | ${siteName}`;
    description = isZh 
      ? `浏览所有标记为"${tag}"的技术文章和教程。`
      : `Browse all articles and tutorials tagged with "${tag}".`;
  }
  
  if (category) {
    title = isZh ? `${category}分类文章 | ${siteName}` : `${category} Articles | ${siteName}`;
    description = isZh 
      ? `浏览${category}分类下的所有技术文章和教程。`
      : `Browse all articles and tutorials in the ${category} category.`;
  }

  // 英文版本不显示 /en 前缀
  const pageUrl = locale === 'en' 
    ? `${siteUrl}/blog${tag ? `?tag=${tag}` : ''}${category ? `?category=${category}` : ''}`
    : `${siteUrl}/${locale}/blog${tag ? `?tag=${tag}` : ''}${category ? `?category=${category}` : ''}`;

  return {
    title,
    description,
    keywords: isZh 
      ? 'Web开发, React, Next.js, TypeScript, 编程教程, 技术博客'
      : 'Web Development, React, Next.js, TypeScript, Programming Tutorials, Tech Blog',
    
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isZh ? 'zh_CN' : 'en_US',
      siteName,
      images: [{
        url: `${siteUrl}/og-blog.jpg`,
        width: 1200,
        height: 630,
        alt: title,
        type: 'image/jpeg'
      }]
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@vibecoding',
      site: '@vibecoding',
      images: [`${siteUrl}/og-blog.jpg`]
    },
    
    alternates: {
      canonical: pageUrl,
      languages: {
        'en': '/blog',
        'zh': '/zh/blog'
      }
    }
  };
}

// 生成结构化数据
export function generateArticleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: (post.coverImage && post.coverImage.trim()) ? {
      '@type': 'ImageObject',
      url: post.coverImage,
      width: 1200,
      height: 630
    } : undefined,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${siteUrl}/about`
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 60
      }
    },
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(' ').length,
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: post.locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.locale === 'en' ? `${siteUrl}/blog/${post.slug}` : `${siteUrl}/${post.locale}/blog/${post.slug}`
    }
  };
}

// 生成博客列表的结构化数据
export function generateBlogListSchema(posts: BlogPost[], locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: locale === 'zh' ? `${siteName} 博客` : `${siteName} Blog`,
    description: locale === 'zh' 
      ? '分享Web开发技术、编程教程和最佳实践'
      : 'Sharing web development technologies, programming tutorials, and best practices',
    url: locale === 'en' ? `${siteUrl}/blog` : `${siteUrl}/${locale}/blog`,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 200,
        height: 60
      }
    },
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: post.locale === 'en' ? `${siteUrl}/blog/${post.slug}` : `${siteUrl}/${post.locale}/blog/${post.slug}`,
      datePublished: post.date,
      dateModified: post.lastModified || post.date,
      author: {
        '@type': 'Person',
        name: post.author
      },
      image: (post.coverImage && post.coverImage.trim()) ? post.coverImage : undefined,
      keywords: post.tags.join(', ')
    }))
  };
}

// 生成面包屑结构化数据
export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${siteUrl}${item.url}` : undefined
    }))
  };
}

// 生成网站搜索框结构化数据
export function generateWebsiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: locale === 'zh' 
      ? '专业的Web开发技术博客，分享React、Next.js、TypeScript等现代开发技术'
      : 'Professional web development blog sharing React, Next.js, TypeScript and modern development technologies',
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/${locale}/blog?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

// 生成robots.txt内容
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/api/sitemap

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific API endpoints
Allow: /api/rss
Allow: /api/sitemap

# Crawl delay
Crawl-delay: 1`;
}