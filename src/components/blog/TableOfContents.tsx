'use client';

import React, { useState, useEffect } from 'react';
import { TableOfContents as TOCType } from '~/types/blog';
import { cn } from '~/lib/design-system';

interface TableOfContentsProps {
  headings: TOCType[];
  activeId?: string;
  className?: string;
}

export default function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    // 观察所有标题元素
    const headingElements = headings.map(heading => 
      document.getElementById(heading.id)
    ).filter(Boolean);

    headingElements.forEach(element => {
      if (element) observer.observe(element);
    });

    // 检查是否应该显示目录
    const checkVisibility = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    checkVisibility();
    window.addEventListener('scroll', checkVisibility, { passive: true });

    return () => {
      headingElements.forEach(element => {
        if (element) observer.unobserve(element);
      });
      window.removeEventListener('scroll', checkVisibility);
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 100; // 留出一些空间
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const renderHeading = (heading: TOCType, level: number = 0) => (
    <li key={heading.id} className={cn('relative', level > 0 && 'ml-4')}>
      <button
        onClick={() => scrollToHeading(heading.id)}
        className={cn(
          'block w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200 hover:bg-gray-100',
          activeId === heading.id
            ? 'text-blue-600 bg-blue-50 font-medium border-l-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900',
          level === 0 && 'font-medium',
          level === 1 && 'text-sm',
          level >= 2 && 'text-xs'
        )}
      >
        {heading.title}
      </button>
      
      {heading.children && heading.children.length > 0 && (
        <ul className="mt-1 space-y-1">
          {heading.children.map(child => renderHeading(child, level + 1))}
        </ul>
      )}
    </li>
  );

  if (headings.length === 0) return null;

  return (
    <div className={cn(
      'fixed top-1/2 right-8 transform -translate-y-1/2 z-30 transition-all duration-300 max-w-xs',
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none',
      className
    )}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h3 className="font-semibold text-gray-900 text-sm">Table of Contents</h3>
        </div>
        
        <nav>
          <ul className="space-y-1">
            {headings.map(heading => renderHeading(heading))}
          </ul>
        </nav>
      </div>
    </div>
  );
}