'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '~/lib/design-system';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  // 如果没有提供items，则根据当前路径自动生成
  const breadcrumbItems = items || generateBreadcrumbItems(pathname, locale);

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-gray-500', className)} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link 
              href={item.href} 
              className="hover:text-gray-700 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              index === breadcrumbItems.length - 1 
                ? 'text-gray-900 font-medium truncate max-w-xs' 
                : 'text-gray-500'
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function generateBreadcrumbItems(pathname: string, locale: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // 首页
  items.push({
    label: locale === 'zh' ? '首页' : 'Home',
    href: `/${locale}`
  });

  // 处理路径段
  let currentPath = '';
  for (let i = 1; i < segments.length; i++) { // 跳过locale段
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    let label = segment;
    let href = `/${locale}${currentPath}`;
    
    // 特殊路径处理
    switch (segment) {
      case 'blog':
        label = locale === 'zh' ? '博客' : 'Blog';
        break;
      default:
        // 对于文章slug，不提供链接
        if (segments[i - 1] === 'blog' && i === segments.length - 1) {
          // 这是文章页面，标题会在页面组件中设置
          label = segment.replace(/-/g, ' ');
          href = undefined;
        }
        break;
    }
    
    items.push({ label, href });
  }

  return items;
}