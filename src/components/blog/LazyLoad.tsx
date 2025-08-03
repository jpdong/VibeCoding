'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '~/lib/design-system';

interface LazyLoadProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
  once?: boolean;
}

export default function LazyLoad({
  children,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
  once = true
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  const shouldRender = once ? hasLoaded : isVisible;

  return (
    <div ref={elementRef} className={cn('transition-opacity duration-300', className)}>
      {shouldRender ? children : (placeholder || <LazyLoadPlaceholder />)}
    </div>
  );
}

// 默认占位符组件
function LazyLoadPlaceholder() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-lg h-48 flex items-center justify-center">
      <div className="text-gray-400">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
}

// 懒加载文本内容组件
export function LazyText({ children, className, lines = 3 }: { 
  children: ReactNode; 
  className?: string; 
  lines?: number; 
}) {
  return (
    <LazyLoad
      className={className}
      placeholder={
        <div className="animate-pulse space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-gray-200 rounded',
                i === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      }
    >
      {children}
    </LazyLoad>
  );
}

// 懒加载卡片组件
export function LazyCard({ children, className }: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <LazyLoad
      className={className}
      placeholder={
        <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </LazyLoad>
  );
}