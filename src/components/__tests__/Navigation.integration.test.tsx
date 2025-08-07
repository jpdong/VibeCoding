/**
 * Integration tests for navigation consistency across all pages
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

// Mock the context and utilities
jest.mock('~/context/common-context', () => ({
  useCommonContext: () => ({
    setShowLoadingModal: jest.fn(),
    userData: { email: null },
    commonText: { loadingText: 'Loading...' },
    authText: {
      loginText: 'Login',
      loginModalDesc: 'Please login',
      loginModalButtonText: 'Login with Google',
      logoutModalDesc: 'Are you sure?',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      toastConfirmText: 'OK'
    },
    menuText: {
      header0: 'Question Hub',
      header1: 'My Questions'
    }
  })
}));

jest.mock('~/utils/buildLink', () => ({
  getLinkHref: (locale: string = 'en', page: string = '') => {
    if (page === '') {
      if (locale === 'en') {
        return '/';
      }
      return `/${locale}/`;
    }
    if (locale === 'en') {
      return `/${page}`;
    }
    return `/${locale}/${page}`;
  }
}));

jest.mock('~/config', () => ({
  languages: [
    { code: 'en-US', lang: 'en', language: 'English', languageInChineseSimple: '英语' },
    { code: 'zh-CN', lang: 'zh', language: '简体中文', languageInChineseSimple: '简体中文' }
  ]
}));

// Mock environment variables
process.env.NEXT_PUBLIC_RESOURCE_VERSION = '1.0.0';
process.env.NEXT_PUBLIC_DOMAIN_NAME = 'Test Domain';
process.env.NEXT_PUBLIC_DISCOVER_OPEN = '1';
process.env.NEXT_PUBLIC_DISCOVER_NAME = 'discover';
process.env.NEXT_PUBLIC_MY_NAME = 'my';
process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN = '0';

describe('Navigation Consistency Tests', () => {
  const testPages = [
    { page: '', description: 'homepage' },
    { page: 'blog', description: 'blog listing page' },
    { page: 'blog/some-post', description: 'blog post page' },
    { page: 'discover', description: 'discover page' },
    { page: 'about', description: 'about page' },
    { page: 'privacy-policy', description: 'privacy policy page' }
  ];

  const testLocales = ['en', 'zh'];

  describe('Blog Navigation Presence', () => {
    testPages.forEach(({ page, description }) => {
      testLocales.forEach(locale => {
        test(`should display blog navigation on ${description} (${locale})`, () => {
          render(<Header locale={locale} page={page} />);
          
          const blogText = locale === 'zh' ? '博客' : 'Blog';
          const blogLinks = screen.getAllByText(blogText);
          
          // Should have at least one blog link (desktop or mobile)
          expect(blogLinks.length).toBeGreaterThan(0);
          
          // Check that blog links have correct href
          blogLinks.forEach(link => {
            const expectedHref = locale === 'en' ? '/blog' : `/${locale}/blog`;
            expect(link.closest('a')).toHaveAttribute('href', expectedHref);
          });
        });
      });
    });
  });

  describe('Active State Detection', () => {
    test('should highlight blog link on blog listing page', () => {
      render(<Header locale="en" page="blog" />);
      
      const blogLinks = screen.getAllByText('Blog');
      const hasActiveLink = blogLinks.some(link => 
        link.className.includes('header-choose-color')
      );
      expect(hasActiveLink).toBe(true);
    });

    test('should highlight blog link on blog post page', () => {
      render(<Header locale="en" page="blog/my-awesome-post" />);
      
      const blogLinks = screen.getAllByText('Blog');
      const hasActiveLink = blogLinks.some(link => 
        link.className.includes('header-choose-color')
      );
      expect(hasActiveLink).toBe(true);
    });

    test('should highlight blog link on nested blog pages', () => {
      render(<Header locale="en" page="blog/category/tech" />);
      
      const blogLinks = screen.getAllByText('Blog');
      const hasActiveLink = blogLinks.some(link => 
        link.className.includes('header-choose-color')
      );
      expect(hasActiveLink).toBe(true);
    });

    test('should not highlight blog link on non-blog pages', () => {
      const nonBlogPages = ['', 'discover', 'about', 'privacy-policy'];
      
      nonBlogPages.forEach(page => {
        render(<Header locale="en" page={page} />);
        
        const blogLinks = screen.getAllByText('Blog');
        const hasActiveLink = blogLinks.some(link => 
          link.className.includes('header-choose-color')
        );
        expect(hasActiveLink).toBe(false);
      });
    });
  });

  describe('Mobile Navigation', () => {
    test('should show blog link in mobile menu', () => {
      render(<Header locale="en" page="" />);
      
      // Find and click mobile menu button
      const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(mobileMenuButton);
      
      // Check that blog link appears in mobile menu
      const blogLinks = screen.getAllByText('Blog');
      expect(blogLinks.length).toBeGreaterThan(0);
    });

    test('should show Chinese blog link in mobile menu', () => {
      render(<Header locale="zh" page="" />);
      
      // Find and click mobile menu button
      const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
      fireEvent.click(mobileMenuButton);
      
      // Check that Chinese blog link appears in mobile menu
      const blogLinks = screen.getAllByText('博客');
      expect(blogLinks.length).toBeGreaterThan(0);
    });
  });

  describe('URL Generation', () => {
    testLocales.forEach(locale => {
      test(`should generate correct blog URLs for ${locale} locale`, () => {
        render(<Header locale={locale} page="" />);
        
        const blogText = locale === 'zh' ? '博客' : 'Blog';
        const blogLinks = screen.getAllByText(blogText);
        
        blogLinks.forEach(link => {
          const expectedHref = locale === 'en' ? '/blog' : `/${locale}/blog`;
          expect(link.closest('a')).toHaveAttribute('href', expectedHref);
        });
      });
    });
  });

  describe('Internationalization', () => {
    test('should display "Blog" in English locale', () => {
      render(<Header locale="en" page="" />);
      
      const blogLinks = screen.getAllByText('Blog');
      expect(blogLinks.length).toBeGreaterThan(0);
      
      // Should not display Chinese text
      const chineseBlogLinks = screen.queryAllByText('博客');
      expect(chineseBlogLinks.length).toBe(0);
    });

    test('should display "博客" in Chinese locale', () => {
      render(<Header locale="zh" page="" />);
      
      const blogLinks = screen.getAllByText('博客');
      expect(blogLinks.length).toBeGreaterThan(0);
      
      // Should not display English text
      const englishBlogLinks = screen.queryAllByText('Blog');
      expect(englishBlogLinks.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<Header locale="en" page="" />);
      
      // Check that navigation has proper ARIA label
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Global');
    });

    test('should have keyboard accessible links', () => {
      render(<Header locale="en" page="" />);
      
      const blogLinks = screen.getAllByRole('link', { name: /blog/i });
      
      blogLinks.forEach(link => {
        // Links should be focusable
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Loading States', () => {
    test('should call loading function when navigating to blog', () => {
      const mockSetShowLoadingModal = jest.fn();
      
      // Mock the context to return our spy function
      jest.doMock('~/context/common-context', () => ({
        useCommonContext: () => ({
          setShowLoadingModal: mockSetShowLoadingModal,
          userData: { email: null },
          commonText: { loadingText: 'Loading...' },
          authText: {
            loginText: 'Login',
            loginModalDesc: 'Please login',
            loginModalButtonText: 'Login with Google',
            logoutModalDesc: 'Are you sure?',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            toastConfirmText: 'OK'
          },
          menuText: {
            header0: 'Question Hub',
            header1: 'My Questions'
          }
        })
      }));

      render(<Header locale="en" page="home" />);
      
      const blogLink = screen.getAllByText('Blog')[0];
      fireEvent.click(blogLink);
      
      // Should call loading function when navigating from non-blog page
      expect(mockSetShowLoadingModal).toHaveBeenCalledWith(true);
    });
  });
});