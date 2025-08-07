import fs from 'fs';
import path from 'path';
import { getAllBlogPosts } from './blog';
import { validateBlogPost } from './content-validation';
import { parseMarkdownFile } from './markdown';

export interface BuildStats {
  totalPosts: number;
  validPosts: number;
  invalidPosts: number;
  totalErrors: number;
  totalWarnings: number;
  buildTime: number;
  generatedPages: string[];
}

export interface BuildOptions {
  validateContent?: boolean;
  generateSitemap?: boolean;
  generateRSS?: boolean;
  optimizeImages?: boolean;
  minifyContent?: boolean;
}

// 构建时内容处理
export async function processBlogContent(options: BuildOptions = {}): Promise<BuildStats> {
  const startTime = Date.now();
  const stats: BuildStats = {
    totalPosts: 0,
    validPosts: 0,
    invalidPosts: 0,
    totalErrors: 0,
    totalWarnings: 0,
    buildTime: 0,
    generatedPages: []
  };

  console.log('🚀 Starting blog content processing...');

  try {
    // 处理所有语言的文章
    const locales = ['en', 'zh'];
    
    for (const locale of locales) {
      console.log(`📝 Processing ${locale} posts...`);
      
      const posts = await getAllBlogPosts(locale);
      stats.totalPosts += posts.length;

      // 验证内容
      if (options.validateContent) {
        console.log(`✅ Validating ${locale} content...`);
        await validateContent(locale, stats);
      }

      // 生成页面路径
      posts.forEach(post => {
        if (!post.draft || process.env.NODE_ENV === 'development') {
          stats.generatedPages.push(`/${locale}/blog/${post.slug}`);
        }
      });

      stats.generatedPages.push(`/${locale}/blog`);
    }

    // 生成站点地图
    if (options.generateSitemap) {
      console.log('🗺️  Generating sitemap...');
      await generateSitemap(stats);
    }

    // 生成RSS
    if (options.generateRSS) {
      console.log('📡 Generating RSS feeds...');
      await generateRSSFeeds(stats);
    }

    // 优化图片
    if (options.optimizeImages) {
      console.log('🖼️  Optimizing images...');
      await optimizeImages();
    }

    stats.buildTime = Date.now() - startTime;
    
    console.log('✨ Blog content processing completed!');
    console.log(`📊 Stats: ${stats.validPosts}/${stats.totalPosts} valid posts, ${stats.totalErrors} errors, ${stats.totalWarnings} warnings`);
    console.log(`⏱️  Build time: ${stats.buildTime}ms`);

    return stats;
  } catch (error) {
    console.error('❌ Error processing blog content:', error);
    throw error;
  }
}

// 验证内容
async function validateContent(locale: string, stats: BuildStats): Promise<void> {
  const contentDir = path.join(process.cwd(), 'content/blog', locale);
  
  if (!fs.existsSync(contentDir)) {
    console.warn(`⚠️  Content directory not found: ${contentDir}`);
    return;
  }

  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(contentDir, file);
    
    try {
      const { metadata, content } = parseMarkdownFile(filePath);
      const validation = validateBlogPost(metadata, content, filePath);
      
      if (validation.isValid) {
        stats.validPosts++;
      } else {
        stats.invalidPosts++;
        console.warn(`⚠️  Validation failed for ${file}:`);
        validation.errors.forEach(error => {
          console.warn(`   - ${error.field}: ${error.message}`);
        });
      }
      
      stats.totalErrors += validation.errors.length;
      stats.totalWarnings += validation.warnings.length;
      
      if (validation.warnings.length > 0) {
        console.warn(`⚠️  Warnings for ${file}:`);
        validation.warnings.forEach(warning => {
          console.warn(`   - ${warning.field}: ${warning.message}`);
        });
      }
    } catch (error) {
      stats.invalidPosts++;
      stats.totalErrors++;
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
}

// 生成站点地图
async function generateSitemap(stats: BuildStats): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com';
  
  const urls = [
    // 静态页面
    { url: siteUrl, lastmod: new Date().toISOString(), priority: 1.0 },
    { url: `${siteUrl}/en/blog`, lastmod: new Date().toISOString(), priority: 0.9 },
    { url: `${siteUrl}/zh/blog`, lastmod: new Date().toISOString(), priority: 0.9 },
    
    // 博客文章页面
    ...stats.generatedPages.map(page => ({
      url: `${siteUrl}${page}`,
      lastmod: new Date().toISOString(),
      priority: page.includes('/blog/') && !page.endsWith('/blog') ? 0.8 : 0.7
    }))
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastmod, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml);
  
  console.log(`✅ Sitemap generated: ${urls.length} URLs`);
}

// 生成RSS订阅源
async function generateRSSFeeds(stats: BuildStats): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com';
  const locales = ['en', 'zh'];

  for (const locale of locales) {
    const posts = await getAllBlogPosts(locale);
    const recentPosts = posts.filter(post => !post.draft).slice(0, 20);

    const rssItems = recentPosts.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${siteUrl}/${locale}/blog/${post.slug}</link>
      <guid>${siteUrl}/${locale}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${post.author}</author>
      <category>${post.category}</category>
${post.tags.map(tag => `      <category>${tag}</category>`).join('\n')}
    </item>`).join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vibe Coding Blog${locale === 'zh' ? ' - 中文' : ''}</title>
    <description>Latest articles about web development, coding, and technology</description>
    <link>${siteUrl}/${locale}/blog</link>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss-${locale}.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

    const rssPath = path.join(process.cwd(), 'public', `rss-${locale}.xml`);
    fs.writeFileSync(rssPath, rssXml);
    
    console.log(`✅ RSS feed generated for ${locale}: ${recentPosts.length} items`);
  }
}

// 优化图片
async function optimizeImages(): Promise<void> {
  const imagesDir = path.join(process.cwd(), 'content/images/blog');
  
  if (!fs.existsSync(imagesDir)) {
    console.warn('⚠️  Images directory not found, skipping optimization');
    return;
  }

  const imageFiles = fs.readdirSync(imagesDir).filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  console.log(`🖼️  Found ${imageFiles.length} images to optimize`);
  
  // 这里可以集成图片优化库，如 sharp
  // 目前只是记录找到的图片
  imageFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
}

// 增量构建支持
export function getChangedFiles(since?: Date): string[] {
  const contentDir = path.join(process.cwd(), 'content/blog');
  const changedFiles: string[] = [];
  
  if (!fs.existsSync(contentDir)) {
    return changedFiles;
  }

  const checkDirectory = (dir: string) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        checkDirectory(filePath);
      } else if (file.endsWith('.md')) {
        if (!since || stat.mtime > since) {
          changedFiles.push(filePath);
        }
      }
    });
  };

  checkDirectory(contentDir);
  return changedFiles;
}

// 清理构建缓存
export function cleanBuildCache(): void {
  const cacheDir = path.join(process.cwd(), '.next/cache');
  
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('🧹 Build cache cleaned');
  }
}

// 生成构建报告
export function generateBuildReport(stats: BuildStats): string {
  const report = `# Blog Build Report

**Build completed at:** ${new Date().toISOString()}

## Statistics
- **Total posts:** ${stats.totalPosts}
- **Valid posts:** ${stats.validPosts}
- **Invalid posts:** ${stats.invalidPosts}
- **Total errors:** ${stats.totalErrors}
- **Total warnings:** ${stats.totalWarnings}
- **Build time:** ${stats.buildTime}ms

## Generated Pages
${stats.generatedPages.map(page => `- ${page}`).join('\n')}

## Performance
- **Average processing time per post:** ${Math.round(stats.buildTime / stats.totalPosts)}ms
- **Success rate:** ${Math.round((stats.validPosts / stats.totalPosts) * 100)}%

---
Generated by Vibe Coding Blog Build System
`;

  return report;
}