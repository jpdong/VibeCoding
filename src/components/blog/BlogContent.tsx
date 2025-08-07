'use client';

import React, { useEffect } from 'react';
import { cn } from '~/lib/design-system';

interface BlogContentProps {
  content: string;
  className?: string;
}

export default function BlogContent({ content, className }: BlogContentProps) {
  useEffect(() => {
    // 为所有外部链接添加 target="_blank"
    const links = document.querySelectorAll('article a[href^="http"]');
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // 为代码块添加复制按钮
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block, index) => {
      const pre = block.parentElement;
      if (!pre || pre.querySelector('.copy-button')) return;

      const button = document.createElement('button');
      button.className = 'copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-600';
      button.textContent = 'Copy';
      button.onclick = async () => {
        try {
          await navigator.clipboard.writeText(block.textContent || '');
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code:', err);
        }
      };

      pre.style.position = 'relative';
      pre.classList.add('group');
      pre.appendChild(button);
    });

    // 为图片添加点击放大功能
    const images = document.querySelectorAll('article img') as NodeListOf<HTMLImageElement>;
    images.forEach(img => {
      img.style.cursor = 'pointer';
      img.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.onclick = () => modal.remove();

        const modalImg = document.createElement('img');
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalImg.className = 'max-w-full max-h-full object-contain';
        modalImg.onclick = (e) => e.stopPropagation();

        const closeButton = document.createElement('button');
        closeButton.className = 'absolute top-4 right-4 text-white text-2xl hover:text-gray-300';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => modal.remove();

        modal.appendChild(modalImg);
        modal.appendChild(closeButton);
        document.body.appendChild(modal);
      };
    });

    // 平滑滚动到锚点
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId || '');
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }, [content]);

  return (
    <div 
      className={cn(
        'blog-content prose prose-lg prose-blue max-w-none',
        // 自定义样式
        'prose-headings:font-bold prose-headings:text-gray-900',
        'prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8',
        'prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2',
        'prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6',
        'prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4',
        'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-gray-900 prose-strong:font-semibold',
        'prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium',
        'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto',
        'prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:my-6',
        'prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4',
        'prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4',
        'prose-li:mb-1',
        'prose-img:rounded-lg prose-img:shadow-md prose-img:my-6',
        'prose-table:border-collapse prose-table:border prose-table:border-gray-300',
        'prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-2 prose-th:font-semibold',
        'prose-td:border prose-td:border-gray-300 prose-td:p-2',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}