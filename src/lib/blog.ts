import { 
  getMarkdownFiles, 
  parseMarkdownFile, 
  renderMarkdown, 
  extractTableOfContents,
  MarkdownError 
} from './markdown';
import { BlogPost, BlogListResponse, RelatedPost, Tag, BlogPagination } from '~/types/blog';

/**
 * 获取所有博客文章
 */
export async function getAllBlogPosts(locale: string = 'en'): Promise<BlogPost[]> {
  const files = getMarkdownFiles(locale);
  const posts: BlogPost[] = [];
  
  for (const filePath of files) {
    try {
      const { metadata, content, slug } = parseMarkdownFile(filePath);
      
      // 跳过草稿文章（在生产环境中）
      if (metadata.draft && process.env.NODE_ENV === 'production') {
        continue;
      }
      
      const renderedContent = await renderMarkdown(content);
      
      const post: BlogPost = {
        slug,
        title: metadata.title,
        description: metadata.description,
        content: renderedContent,
        date: metadata.date,
        author: metadata.author,
        tags: metadata.tags,
        category: metadata.category,
        featured: metadata.featured,
        draft: metadata.draft,
        readingTime: metadata.readingTime,
        coverImage: metadata.coverImage,
        locale,
        lastModified: metadata.date // 可以后续从文件系统获取
      };
      
      posts.push(post);
    } catch (error) {
      console.error(`Error processing blog post ${filePath}:`, error);
      // 在开发环境中继续处理其他文件，在生产环境中可能需要不同的处理方式
      if (process.env.NODE_ENV === 'development') {
        continue;
      }
    }
  }
  
  // 按日期排序（最新的在前）
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 根据slug获取单篇博客文章
 */
export async function getBlogPostBySlug(slug: string, locale: string = 'en'): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts(locale);
  return posts.find(post => post.slug === slug) || null;
}

/**
 * 获取分页的博客文章列表
 */
export async function getBlogPostsPaginated(
  page: number = 1,
  limit: number = 10,
  locale: string = 'en'
): Promise<{ posts: BlogPost[]; pagination: BlogPagination }> {
  const allPosts = await getAllBlogPosts(locale);
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const posts = allPosts.slice(startIndex, endIndex);
  
  const pagination: BlogPagination = {
    currentPage: page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
  
  return { posts, pagination };
}

/**
 * 获取精选文章
 */
export async function getFeaturedPosts(locale: string = 'en', limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts(locale);
  return allPosts.filter(post => post.featured).slice(0, limit);
}

/**
 * 根据标签过滤文章
 */
export async function getBlogPostsByTag(tag: string, locale: string = 'en'): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts(locale);
  return allPosts.filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * 根据分类过滤文章
 */
export async function getBlogPostsByCategory(category: string, locale: string = 'en'): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts(locale);
  return allPosts.filter(post => 
    post.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * 搜索博客文章
 */
export async function searchBlogPosts(
  query: string, 
  locale: string = 'en'
): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts(locale);
  const searchTerm = query.toLowerCase();
  
  return allPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.description.toLowerCase().includes(searchTerm) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    post.category.toLowerCase().includes(searchTerm)
  );
}

/**
 * 获取所有标签及其使用次数
 */
export async function getAllTags(locale: string = 'en'): Promise<Tag[]> {
  const allPosts = await getAllBlogPosts(locale);
  const tagCounts: Record<string, number> = {};
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .map(([name, count]) => ({
      name,
      count,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 获取所有分类
 */
export async function getAllCategories(locale: string = 'en'): Promise<string[]> {
  const allPosts = await getAllBlogPosts(locale);
  const categories = new Set(allPosts.map(post => post.category));
  return Array.from(categories).sort();
}

/**
 * 获取相关文章
 */
export async function getRelatedPosts(
  currentPost: BlogPost, 
  limit: number = 3
): Promise<RelatedPost[]> {
  const allPosts = await getAllBlogPosts(currentPost.locale);
  
  // 排除当前文章
  const otherPosts = allPosts.filter(post => post.slug !== currentPost.slug);
  
  // 计算相关性分数
  const scoredPosts = otherPosts.map(post => {
    let score = 0;
    
    // 相同分类加分
    if (post.category === currentPost.category) {
      score += 3;
    }
    
    // 共同标签加分
    const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
    score += commonTags.length * 2;
    
    // 相同作者加分
    if (post.author === currentPost.author) {
      score += 1;
    }
    
    return { post, score };
  });
  
  // 按分数排序并返回前N个
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      readingTime: post.readingTime,
      tags: post.tags
    }));
}

/**
 * 获取最近的文章
 */
export async function getRecentPosts(locale: string = 'en', limit: number = 5): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts(locale);
  return allPosts.slice(0, limit);
}

/**
 * 获取博客统计信息
 */
export async function getBlogStats(locale: string = 'en') {
  const allPosts = await getAllBlogPosts(locale);
  const tags = await getAllTags(locale);
  const categories = await getAllCategories(locale);
  
  return {
    totalPosts: allPosts.length,
    totalTags: tags.length,
    totalCategories: categories.length,
    featuredPosts: allPosts.filter(post => post.featured).length,
    draftPosts: allPosts.filter(post => post.draft).length,
    averageReadingTime: Math.round(
      allPosts.reduce((sum, post) => sum + post.readingTime, 0) / allPosts.length
    )
  };
}

/**
 * 获取完整的博客列表响应（包含元数据）
 */
export async function getBlogListResponse(
  page: number = 1,
  limit: number = 10,
  locale: string = 'en'
): Promise<BlogListResponse> {
  const { posts, pagination } = await getBlogPostsPaginated(page, limit, locale);
  const tags = await getAllTags(locale);
  const categories = await getAllCategories(locale);
  
  return {
    posts,
    totalCount: (await getAllBlogPosts(locale)).length,
    hasMore: pagination.hasNext,
    tags,
    categories
  };
}