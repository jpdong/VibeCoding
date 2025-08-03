import { NextRequest, NextResponse } from 'next/server';
import { getBlogListResponse, searchBlogPosts } from '~/lib/blog';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url && request.url.trim() ? request.url : 'http://localhost:3000');
    const { searchParams } = url;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const locale = searchParams.get('locale') || 'en';
    const query = searchParams.get('q');
    
    // 如果有搜索查询，返回搜索结果
    if (query) {
      const searchResults = await searchBlogPosts(query, locale);
      return NextResponse.json({
        posts: searchResults,
        totalCount: searchResults.length,
        hasMore: false,
        tags: [],
        categories: []
      });
    }
    
    // 否则返回分页的博客列表
    const response = await getBlogListResponse(page, limit, locale);
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// 添加静态生成支持
export const dynamic = 'force-dynamic';