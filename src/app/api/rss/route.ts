import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts } from '~/lib/blog';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url && request.url.trim() ? request.url : 'http://localhost:3000');
    const { searchParams } = url;
    const locale = searchParams.get('locale') || 'en';
    
    const posts = await getAllBlogPosts(locale);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com';
    
    const rssItems = posts
      .filter(post => !post.draft)
      .slice(0, 20) // 限制RSS条目数量
      .map(post => `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <description><![CDATA[${post.description}]]></description>
          <link>${siteUrl}/${locale}/blog/${post.slug}</link>
          <guid>${siteUrl}/${locale}/blog/${post.slug}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <author>${post.author}</author>
          <category>${post.category}</category>
          ${post.tags.map(tag => `<category>${tag}</category>`).join('')}
        </item>
      `).join('');
    
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Vibe Coding Blog</title>
          <description>Latest articles about web development, coding, and technology</description>
          <link>${siteUrl}/${locale}/blog</link>
          <language>${locale}</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <atom:link href="${siteUrl}/api/rss?locale=${locale}" rel="self" type="application/rss+xml"/>
          ${rssItems}
        </channel>
      </rss>`;
    
    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    );
  }
}

// 添加静态生成支持
export const dynamic = 'force-dynamic';