'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tag } from '~/types/blog';
import { cn } from '~/lib/design-system';

interface TagCloudProps {
  tags: Tag[];
  selectedTags?: string[];
  onTagClick?: (tag: string) => void;
  maxTags?: number;
  className?: string;
}

export default function TagCloud({ 
  tags, 
  selectedTags = [], 
  onTagClick,
  maxTags = 20,
  className 
}: TagCloudProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  
  // 按使用次数排序并限制数量
  const sortedTags = tags
    .sort((a, b) => b.count - a.count)
    .slice(0, maxTags);

  // 计算标签大小（基于使用次数）
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...tags.map(tag => tag.count));
    const minCount = Math.min(...tags.map(tag => tag.count));
    const ratio = maxCount > minCount ? (count - minCount) / (maxCount - minCount) : 0.5;
    
    if (ratio > 0.8) return 'text-lg font-semibold';
    if (ratio > 0.6) return 'text-base font-medium';
    if (ratio > 0.4) return 'text-sm font-medium';
    return 'text-sm font-normal';
  };

  // 获取标签颜色
  const getTagColor = (count: number, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-blue-600 text-white border-blue-600';
    }
    
    const maxCount = Math.max(...tags.map(tag => tag.count));
    const ratio = count / maxCount;
    
    if (ratio > 0.8) return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
    if (ratio > 0.6) return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
    if (ratio > 0.4) return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
  };

  if (sortedTags.length === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-gray-500">
          {locale === 'zh' ? '暂无标签' : 'No tags available'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {sortedTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        const commonClassName = cn(
          'inline-flex items-center px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105',
          getTagSize(tag.count),
          getTagColor(tag.count, isSelected),
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        );
        const title = `${tag.count} ${tag.count === 1 ? 'post' : 'posts'}`;

        if (onTagClick) {
          return (
            <button
              key={tag.name}
              onClick={() => onTagClick(tag.name)}
              className={commonClassName}
              title={title}
            >
              <span>{tag.name}</span>
              <span className="ml-1.5 text-xs opacity-75">
                {tag.count}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={tag.name}
            href={`/${locale}/blog?tag=${encodeURIComponent(tag.name)}`}
            className={commonClassName}
            title={title}
          >
            <span>{tag.name}</span>
            <span className="ml-1.5 text-xs opacity-75">
              {tag.count}
            </span>
          </Link>
        );
      })}
      
      {tags.length > maxTags && (
        <div className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500">
          +{tags.length - maxTags} more
        </div>
      )}
    </div>
  );
}