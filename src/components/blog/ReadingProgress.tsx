'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '~/lib/design-system';

interface ReadingProgressProps {
  target: string;
  className?: string;
}

export default function ReadingProgress({ target, className }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const updateProgress = () => {
      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const documentHeight = targetElement.scrollHeight;
      
      // 计算滚动进度
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = documentHeight - windowHeight;
      const scrollProgress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      
      setProgress(scrollProgress * 100);
      
      // 当开始阅读时显示进度条
      setIsVisible(scrollTop > 100);
    };

    // 初始计算
    updateProgress();

    // 监听滚动事件
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [target]);

  return (
    <>
      {/* 顶部进度条 */}
      <div className={cn(
        'fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 圆形进度指示器（可选） */}
      <div className={cn(
        'fixed bottom-8 right-8 w-12 h-12 z-40 transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        <div className="relative w-full h-full">
          {/* 背景圆环 */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* 进度圆环 */}
            <path
              className="text-blue-500"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          
          {/* 中心百分比文字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}