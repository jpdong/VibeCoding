/**
 * Tests for Header component blog navigation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
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
  getLinkHref: (locale: string, page: string) => `/${locale}/${page}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
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

describe('Header Blog Navigation', () => {
  test('should display blog link in desktop navigation', () => {
    render(<Header locale="en" page="" />);
    
    // Check for blog link in desktop navigation
    const blogLinks = screen.getAllByText('Blog');
    expect(blogLinks.length).toBeGreaterThan(0);
  });

  test('should display blog link in Chinese', () => {
    render(<Header locale="zh" page="" />);
    
    // Check for Chinese blog link
    const blogLinks = screen.getAllByText('博客');
    expect(blogLinks.length).toBeGreaterThan(0);
  });

  test('should highlight blog link when on blog page', () => {
    render(<Header locale="en" page="blog" />);
    
    // Find blog links and check if any have the active class
    const blogLinks = screen.getAllByText('Blog');
    const activeLink = blogLinks.find(link => 
      link.className.includes('header-choose-color')
    );
    expect(activeLink).toBeTruthy();
  });

  test('should highlight blog link when on blog post page', () => {
    render(<Header locale="en" page="blog/some-post" />);
    
    // Find blog links and check if any have the active class
    const blogLinks = screen.getAllByText('Blog');
    const activeLink = blogLinks.find(link => 
      link.className.includes('header-choose-color')
    );
    expect(activeLink).toBeTruthy();
  });

  test('should not highlight blog link when on other pages', () => {
    render(<Header locale="en" page="about" />);
    
    // Find blog links and check that none have the active class
    const blogLinks = screen.getAllByText('Blog');
    const activeLink = blogLinks.find(link => 
      link.className.includes('header-choose-color')
    );
    expect(activeLink).toBeFalsy();
  });

  test('should have proper href attributes for blog links', () => {
    render(<Header locale="en" page="" />);
    
    // Check that blog links have correct href (English doesn't include locale prefix)
    const blogLinks = screen.getAllByRole('link', { name: /blog/i });
    blogLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/blog');
    });
  });

  test('should have proper href attributes for Chinese blog links', () => {
    render(<Header locale="zh" page="" />);
    
    // Check that Chinese blog links have correct href
    const blogLinks = screen.getAllByRole('link', { name: /博客/i });
    blogLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/zh/blog');
    });
  });
});