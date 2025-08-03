'use client';

import React from 'react';
import Link from 'next/link';
import BlogCard from './BlogCard';
import { BlogPost, BlogPagination } from '~/types/blog';
import { cn } from '~/lib/design-system';

interface BlogListProps {
  posts: BlogPost[];
  locale: string;
  pagination?: BlogPagination;
  className?: string;
}

export default function BlogList({ posts, locale, pagination, className }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {locale === 'zh' ? '暂无文章' : 'No articles found'}
          </h3>
          <p className="text-gray-500">
            {locale === 'zh' 
              ? '目前还没有发布任何文章，请稍后再来查看。'
              : 'No articles have been published yet. Please check back later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* 文章网格 */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <div
            key={post.slug}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <BlogCard 
              post={post} 
              size="medium"
              showExcerpt={true}
            />
          </div>
        ))}
      </div>

      {/* 分页导航 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          {/* 上一页 */}
          {pagination.hasPrev && (
            <Link
              href={`/${locale}/blog?page=${pagination.currentPage - 1}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {locale === 'zh' ? '上一页' : 'Previous'}
            </Link>
          )}

          {/* 页码 */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                // 显示当前页前后2页
                const current = pagination.currentPage;
                return page === 1 || 
                       page === pagination.totalPages || 
                       (page >= current - 2 && page <= current + 2);
              })
              .map((page, index, array) => {
                // 添加省略号
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="px-3 py-2 text-sm text-gray-500">...</span>
                    )}
                    <Link
                      href={`/${locale}/blog?page=${page}`}
                      className={cn(
                        'inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      {page}
                    </Link>
                  </React.Fragment>
                );
              })}
          </div>

          {/* 下一页 */}
          {pagination.hasNext && (
            <Link
              href={`/${locale}/blog?page=${pagination.currentPage + 1}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              {locale === 'zh' ? '下一页' : 'Next'}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* 页面信息 */}
      {pagination && (
        <div className="text-center text-sm text-gray-500 pt-4">
          {locale === 'zh' 
            ? `第 ${pagination.currentPage} 页，共 ${pagination.totalPages} 页`
            : `Page ${pagination.currentPage} of ${pagination.totalPages}`}
        </div>
      )}
    </div>
  );
}