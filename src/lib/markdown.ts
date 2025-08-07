import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import { rehype } from 'rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import readingTime from 'reading-time';
import { BlogPost, BlogMetadata, TableOfContents } from '~/types/blog';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export class MarkdownError extends Error {
  constructor(
    public filePath: string,
    public message: string,
    public originalError?: Error
  ) {
    super(`Markdown Error in ${filePath}: ${message}`);
  }
}

/**
 * 获取指定语言的所有Markdown文件路径
 */
export function getMarkdownFiles(locale: string): string[] {
  const localeDir = path.join(contentDirectory, locale);
  
  if (!fs.existsSync(localeDir)) {
    return [];
  }
  
  try {
    return fs.readdirSync(localeDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(localeDir, file));
  } catch (error) {
    console.error(`Error reading markdown files for locale ${locale}:`, error);
    return [];
  }
}

/**
 * 解析Markdown文件的frontmatter和内容
 */
export function parseMarkdownFile(filePath: string): { metadata: BlogMetadata; content: string; slug: string } {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // 从文件名生成slug
    const fileName = path.basename(filePath, '.md');
    const slug = fileName.replace(/^\d{4}-\d{2}-\d{2}-/, ''); // 移除日期前缀
    
    // 验证必需的frontmatter字段
    const requiredFields = ['title', 'description', 'date', 'author'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new MarkdownError(filePath, `Missing required frontmatter field: ${field}`);
      }
    }
    
    // 计算阅读时间
    const readingStats = readingTime(content);
    
    const metadata: BlogMetadata = {
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      tags: data.tags || [],
      category: data.category || 'General',
      featured: data.featured || false,
      draft: data.draft || false,
      readingTime: data.readingTime || Math.ceil(readingStats.minutes),
      coverImage: data.coverImage
    };
    
    return { metadata, content, slug };
  } catch (error) {
    if (error instanceof MarkdownError) {
      throw error;
    }
    throw new MarkdownError(filePath, 'Failed to parse markdown file', error as Error);
  }
}

/**
 * 将Markdown内容渲染为HTML
 */
export async function renderMarkdown(content: string): Promise<string> {
  try {
    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content);
    
    const htmlContent = await rehype()
      .use(rehypeHighlight)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          className: ['anchor-link']
        }
      })
      .process(processedContent.toString());
    
    return htmlContent.toString();
  } catch (error) {
    console.error('Error rendering markdown:', error);
    throw new Error('Failed to render markdown content');
  }
}

/**
 * 从HTML内容提取目录
 */
export function extractTableOfContents(htmlContent: string): TableOfContents[] {
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/g;
  const headings: TableOfContents[] = [];
  let match;
  
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const title = match[3].replace(/<[^>]*>/g, ''); // 移除HTML标签
    
    headings.push({
      id,
      title,
      level
    });
  }
  
  return buildNestedToc(headings);
}

/**
 * 构建嵌套的目录结构
 */
function buildNestedToc(headings: TableOfContents[]): TableOfContents[] {
  const result: TableOfContents[] = [];
  const stack: TableOfContents[] = [];
  
  for (const heading of headings) {
    // 找到合适的父级
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      result.push(heading);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }
    
    stack.push(heading);
  }
  
  return result;
}

/**
 * 生成文章的slug（用于URL）
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * 验证日期格式
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}