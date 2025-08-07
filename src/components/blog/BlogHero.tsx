'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '~/types/blog';
import { cn } from '~/lib/design-system';
import { isValidCoverImage, createImageErrorHandler } from '~/lib/image-utils';

interface BlogHeroProps {
  featuredPost?: BlogPost;
  recentPosts: BlogPost[];
  className?: string;
}

export default function BlogHero({ featuredPost, recentPosts, className }: BlogHeroProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!featuredPost) return null;

  // Validate featured post cover image
  const hasValidFeaturedImage = isValidCoverImage(featuredPost.coverImage) && !imageError;
  const handleImageError = createImageErrorHandler(() => setImageError(true));

  return (
    <section className={cn('relative py-16 bg-gradient-to-br from-gray-50 to-blue-50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          'gap-12 items-center',
          hasValidFeaturedImage ? 'grid lg:grid-cols-2' : 'flex justify-center'
        )}>
          {/* 主要特色文章 */}
          <div className={cn(
            'space-y-6',
            !hasValidFeaturedImage && 'text-center max-w-4xl'
          )}>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Article
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {featuredPost.title}
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {featuredPost.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {featuredPost.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{featuredPost.author}</div>
                  <div className="text-gray-500">Author</div>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div>
                <div className="font-medium text-gray-900">
                  {new Date(featuredPost.date).toLocaleDateString(featuredPost.locale === 'zh' ? 'zh-CN' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-gray-500">{featuredPost.readingTime} min read</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {featuredPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <Link
              href={`/${featuredPost.locale}/blog/${featuredPost.slug}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Read Full Article
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {/* 特色文章图片 */}
          {hasValidFeaturedImage && (
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={featuredPost.coverImage!}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* 最近文章卡片 */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 max-w-xs hidden lg:block">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Articles</h3>
                <div className="space-y-3">
                  {recentPosts.slice(0, 2).map((post) => {
                    const hasPostImage = isValidCoverImage(post.coverImage);
                    return (
                      <Link
                        key={post.slug}
                        href={`/${post.locale}/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className={cn(
                          'flex items-start gap-3',
                          !hasPostImage && 'items-center' // Center align when no image
                        )}>
                          {hasPostImage && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={post.coverImage!}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {post.readingTime} min read
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}