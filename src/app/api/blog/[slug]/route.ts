import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostBySlug, getRelatedPosts } from '~/lib/blog';
import { extractTableOfContents } from '~/lib/markdown';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const url = new URL(request.url && request.url.trim() ? request.url : 'http://localhost:3000');
    const { searchParams } = url;
    const locale = searchParams.get('locale') || 'en';
    const { slug } = params;
    
    const post = await getBlogPostBySlug(slug, locale);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // 获取相关文章
    const relatedPosts = await getRelatedPosts(post, 3);
    
    // 提取目录
    const tableOfContents = extractTableOfContents(post.content);
    
    const response = {
      post,
      relatedPosts,
      tableOfContents
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// 添加静态生成支持
export const dynamic = 'force-dynamic';