// 性能监控工具

export interface PerformanceMetrics {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Web Vitals 阈值
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
};

// 获取性能评级
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// 发送性能数据到分析服务
function sendToAnalytics(metric: PerformanceMetrics) {
  // 在生产环境中，这里可以发送到 Google Analytics, Vercel Analytics 等
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Metric:', metric);
  }
  
  // 示例：发送到 Google Analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        custom_parameter_1: metric.rating,
        non_interaction: true
      });
    }
  }
}

// 监控 Web Vitals
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // 基础性能监控
  window.addEventListener('load', () => {
    // 监控页面加载时间
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const performanceMetric: PerformanceMetrics = {
        name: 'page_load_time',
        value: loadTime,
        rating: getRating('LCP', loadTime), // 使用 LCP 的评级标准
        timestamp: Date.now()
      };
      sendToAnalytics(performanceMetric);
    }

    // 监控首次内容绘制时间
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      const performanceMetric: PerformanceMetrics = {
        name: 'FCP',
        value: fcp.startTime,
        rating: getRating('FCP', fcp.startTime),
        timestamp: Date.now()
      };
      sendToAnalytics(performanceMetric);
    }
  });
}

// 测量自定义性能指标
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const startTime = performance.now();
  
  const finish = () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const metric: PerformanceMetrics = {
      name: `custom_${name}`,
      value: duration,
      rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
      timestamp: Date.now()
    };
    
    sendToAnalytics(metric);
  };

  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(finish);
    } else {
      finish();
      return result;
    }
  } catch (error) {
    finish();
    throw error;
  }
}

// 监控资源加载性能
export function monitorResourceLoading() {
  if (typeof window === 'undefined') return;

  // 监控图片加载
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (img.complete) return;

    const startTime = performance.now();
    
    img.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      const metric: PerformanceMetrics = {
        name: 'image_load',
        value: loadTime,
        rating: loadTime < 500 ? 'good' : loadTime < 1000 ? 'needs-improvement' : 'poor',
        timestamp: Date.now()
      };
      sendToAnalytics(metric);
    });

    img.addEventListener('error', () => {
      const metric: PerformanceMetrics = {
        name: 'image_error',
        value: 1,
        rating: 'poor',
        timestamp: Date.now()
      };
      sendToAnalytics(metric);
    });
  });
}

// 内存使用监控
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const memory = (performance as any).memory;
  
  const metric: PerformanceMetrics = {
    name: 'memory_usage',
    value: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
    rating: memory.usedJSHeapSize / memory.jsHeapSizeLimit < 0.7 ? 'good' : 'needs-improvement',
    timestamp: Date.now()
  };
  
  sendToAnalytics(metric);
}

// 页面可见性变化监控
export function monitorPageVisibility() {
  if (typeof window === 'undefined') return;

  let startTime = Date.now();
  let isVisible = !document.hidden;

  const handleVisibilityChange = () => {
    const now = Date.now();
    
    if (document.hidden && isVisible) {
      // 页面变为不可见
      const visibleTime = now - startTime;
      const metric: PerformanceMetrics = {
        name: 'page_visible_time',
        value: visibleTime,
        rating: 'good',
        timestamp: now
      };
      sendToAnalytics(metric);
      isVisible = false;
    } else if (!document.hidden && !isVisible) {
      // 页面变为可见
      startTime = now;
      isVisible = true;
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 页面卸载时记录总可见时间
  window.addEventListener('beforeunload', () => {
    if (isVisible) {
      const totalVisibleTime = Date.now() - startTime;
      const metric: PerformanceMetrics = {
        name: 'total_page_time',
        value: totalVisibleTime,
        rating: 'good',
        timestamp: Date.now()
      };
      sendToAnalytics(metric);
    }
  });
}

// 错误监控
export function monitorErrors() {
  if (typeof window === 'undefined') return;

  // JavaScript 错误
  window.addEventListener('error', (event) => {
    const metric: PerformanceMetrics = {
      name: 'javascript_error',
      value: 1,
      rating: 'poor',
      timestamp: Date.now()
    };
    sendToAnalytics(metric);
  });

  // Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    const metric: PerformanceMetrics = {
      name: 'promise_rejection',
      value: 1,
      rating: 'poor',
      timestamp: Date.now()
    };
    sendToAnalytics(metric);
  });
}

// 初始化所有性能监控
export function initAllPerformanceMonitoring() {
  initPerformanceMonitoring();
  monitorResourceLoading();
  monitorPageVisibility();
  monitorErrors();
  
  // 定期监控内存使用
  setInterval(monitorMemoryUsage, 30000); // 每30秒检查一次
}