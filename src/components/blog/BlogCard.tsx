'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '~/types/blog';
import { cn } from '~/lib/design-system';

interface BlogCardProps {
  post: BlogPost;
  size?: 'small' | 'medium' | 'large';
  showExcerpt?: boolean;
  className?: string;
}

export default function BlogCard({ 
  post, 
  size = 'medium', 
  showExcerpt = true,
  className 
}: BlogCardProps) {
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  };
  
  const titleClasses = {
    small: 'text-lg font-semibold',
    medium: 'text-xl font-bold',
    large: 'text-2xl font-bold'
  };
  
  const imageClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64'
  };

  return (
    <article className={cn(
      'group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out overflow-hidden border border-gray-100',
      'hover:-translate-y-1 hover:scale-[1.02]',
      sizeClasses[size],
      className
    )}>
      <Link href={`/${post.locale}/blog/${post.slug}`} className="block">
        {/* 封面图片 */}
        {post.coverImage && post.coverImage.trim() && (
          <div className={cn(
            'relative overflow-hidden rounded-lg mb-4 bg-gray-100',
            imageClasses[size]
          )}>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {post.featured && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </div>
            )}
          </div>
        )}
        
        {/* 文章元信息 */}
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
          <time dateTime={post.date} className="font-medium">
            {new Date(post.date).toLocaleDateString(post.locale === 'zh' ? 'zh-CN' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>•</span>
          <span>{post.readingTime} min read</span>
          <span>•</span>
          <span className="text-blue-600 font-medium">{post.category}</span>
        </div>
        
        {/* 标题 */}
        <h2 className={cn(
          'text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2',
          titleClasses[size]
        )}>
          {post.title}
        </h2>
        
        {/* 描述 */}
        {showExcerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {post.description}
          </p>
        )}
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* 作者信息 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{post.author}</span>
          </div>
          
          <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
            Read more
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}