// 动画和过渡效果配置
export const animations = {
  // 页面进入动画
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  
  // 卡片悬停效果
  cardHover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // 阅读进度条
  readingProgress: {
    scaleX: 0,
    transformOrigin: 'left',
    transition: { duration: 0.1, ease: 'linear' }
  },
  
  // 淡入动画
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 }
  },
  
  // 滑入动画
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// 设计系统配置
export const designSystem = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75'
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace']
    },
    
    fontSize: {
      'blog-hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '800' }],
      'blog-title': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      'blog-subtitle': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],
      'blog-body': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
      'blog-caption': ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }]
    }
  },
  
  spacing: {
    'blog-section': '4rem',
    'blog-paragraph': '1.5rem',
    'blog-margin': '2rem',
    'card-padding': '1.5rem'
  },
  
  borderRadius: {
    'card': '0.75rem',
    'button': '0.5rem',
    'image': '0.5rem'
  },
  
  shadows: {
    'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'button-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
};

// CSS类名工具函数
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}