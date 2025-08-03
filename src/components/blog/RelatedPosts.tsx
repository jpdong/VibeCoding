'use client';

import React from 'react';
import Link from 'next/link';
import { RelatedPost } from '~/types/blog';
import { cn } from '~/lib/design-system';

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentPostId: string;
  locale: string;
  className?: string;
}

export default function RelatedPosts({ posts, currentPostId, locale, className }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className={cn('space-y-8', className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {locale === 'zh' ? '相关文章' : 'Related Articles'}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {locale === 'zh' 
            ? '继续探索这些相关的技术文章和教程'
            : 'Continue exploring these related technical articles and tutorials'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <article
            key={post.slug}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link href={`/${locale}/blog/${post.slug}`} className="block p-6 h-full">
              <div className="space-y-4">
                {/* 文章元信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {post.readingTime} min
                  </span>
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                  {post.title}
                </h3>

                {/* 描述 */}
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {post.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      +{post.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* 阅读更多指示器 */}
                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200 pt-2">
                  {locale === 'zh' ? '阅读更多' : 'Read more'}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* 查看更多文章链接 */}
      <div className="text-center pt-8">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {locale === 'zh' ? '查看所有文章' : 'View All Articles'}
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}