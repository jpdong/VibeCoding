import { NextRequest, NextResponse } from 'next/server';
import { getAllTags, getBlogPostsByTag } from '~/lib/blog';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url && request.url.trim() ? request.url : 'http://localhost:3000');
    const { searchParams } = url;
    const locale = searchParams.get('locale') || 'en';
    const tag = searchParams.get('tag');
    
    if (tag) {
      // 返回特定标签的文章
      const posts = await getBlogPostsByTag(tag, locale);
      return NextResponse.json({ posts });
    } else {
      // 返回所有标签
      const tags = await getAllTags(locale);
      return NextResponse.json({ tags });
    }
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// 添加静态生成支持
export const dynamic = 'force-dynamic';