'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '~/lib/design-system';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== currentPath) {
      // 路径改变时，先隐藏内容
      setIsVisible(false);
      
      // 短暂延迟后更新路径并显示新内容
      const timer = setTimeout(() => {
        setCurrentPath(pathname);
        setIsVisible(true);
      }, 150);
      
      return () => clearTimeout(timer);
    } else {
      // 初始加载或相同路径时直接显示
      setIsVisible(true);
    }
  }, [pathname, currentPath]);

  return (
    <div className={cn(
      'transition-all duration-300 ease-in-out',
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-4',
      className
    )}>
      {children}
    </div>
  );
}

// 页面加载动画组件
export function PageLoader({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

// 平滑滚动工具函数
export function smoothScrollTo(elementId: string, offset: number = 100) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
}

// 页面滚动到顶部
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}