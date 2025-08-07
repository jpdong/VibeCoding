import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts } from '~/lib/blog';

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com';
    
    // 获取所有语言的文章
    const enPosts = await getAllBlogPosts('en');
    const zhPosts = await getAllBlogPosts('zh');
    
    const blogUrls = [
      ...enPosts.filter(post => !post.draft).map(post => ({
        url: `${siteUrl}/en/blog/${post.slug}`,
        lastModified: post.lastModified || post.date,
        changeFreq: 'weekly',
        priority: post.featured ? 0.8 : 0.6
      })),
      ...zhPosts.filter(post => !post.draft).map(post => ({
        url: `${siteUrl}/zh/blog/${post.slug}`,
        lastModified: post.lastModified || post.date,
        changeFreq: 'weekly',
        priority: post.featured ? 0.8 : 0.6
      }))
    ];
    
    // 获取所有标签页面
    const allTags = new Set([
      ...enPosts.flatMap(post => post.tags),
      ...zhPosts.flatMap(post => post.tags)
    ]);
    
    const tagUrls = Array.from(allTags).flatMap(tag => [
      {
        url: `${siteUrl}/en/blog?tag=${encodeURIComponent(tag)}`,
        lastModified: new Date().toISOString(),
        changeFreq: 'weekly',
        priority: 0.5
      },
      {
        url: `${siteUrl}/zh/blog?tag=${encodeURIComponent(tag)}`,
        lastModified: new Date().toISOString(),
        changeFreq: 'weekly',
        priority: 0.5
      }
    ]);
    
    const staticUrls = [
      {
        url: siteUrl,
        lastModified: new Date().toISOString(),
        changeFreq: 'daily',
        priority: 1.0
      },
      {
        url: `${siteUrl}/en`,
        lastModified: new Date().toISOString(),
        changeFreq: 'daily',
        priority: 1.0
      },
      {
        url: `${siteUrl}/zh`,
        lastModified: new Date().toISOString(),
        changeFreq: 'daily',
        priority: 1.0
      },
      {
        url: `${siteUrl}/en/blog`,
        lastModified: new Date().toISOString(),
        changeFreq: 'daily',
        priority: 0.9
      },
      {
        url: `${siteUrl}/zh/blog`,
        lastModified: new Date().toISOString(),
        changeFreq: 'daily',
        priority: 0.9
      },
      {
        url: `${siteUrl}/en/privacy-policy`,
        lastModified: new Date().toISOString(),
        changeFreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${siteUrl}/zh/privacy-policy`,
        lastModified: new Date().toISOString(),
        changeFreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${siteUrl}/en/terms-of-service`,
        lastModified: new Date().toISOString(),
        changeFreq: 'monthly',
        priority: 0.3
      },
      {
        url: `${siteUrl}/zh/terms-of-service`,
        lastModified: new Date().toISOString(),
        changeFreq: 'monthly',
        priority: 0.3
      }
    ];
    
    const allUrls = [...staticUrls, ...blogUrls, ...tagUrls];
    
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${allUrls.map(({ url, lastModified, changeFreq, priority }) => `
          <url>
            <loc>${url}</loc>
            <lastmod>${lastModified}</lastmod>
            <changefreq>${changeFreq}</changefreq>
            <priority>${priority}</priority>
          </url>
        `).join('')}
      </urlset>`;
    
    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}