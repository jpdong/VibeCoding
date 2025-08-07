// 监控和错误追踪配置

export interface MonitoringConfig {
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableUserAnalytics: boolean;
  sampleRate: number;
  environment: string;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

class MonitoringService {
  private config: MonitoringConfig;
  private sessionId: string;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    
    if (typeof window !== 'undefined') {
      this.initializeClientSideMonitoring();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeClientSideMonitoring() {
    // 全局错误处理
    if (this.config.enableErrorTracking) {
      window.addEventListener('error', (event) => {
        this.reportError({
          message: event.message,
          stack: event.error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.reportError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          additionalData: {
            type: 'unhandledrejection',
            reason: event.reason
          }
        });
      });
    }

    // 性能监控
    if (this.config.enablePerformanceMonitoring) {
      this.initializePerformanceMonitoring();
    }

    // 用户分析
    if (this.config.enableUserAnalytics) {
      this.initializeUserAnalytics();
    }
  }

  private initializePerformanceMonitoring() {
    // 基础性能监控
    if (typeof window !== 'undefined') {
      // 监控页面加载时间
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.reportPerformanceMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            unit: 'ms',
            timestamp: Date.now(),
            tags: { type: 'navigation' }
          });
        }
      });

      // 监控资源加载
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            this.reportPerformanceMetric({
              name: 'resource_load_time',
              value: resource.responseEnd - resource.fetchStart,
              unit: 'ms',
              timestamp: Date.now(),
              tags: { 
                resource: resource.name,
                type: resource.initiatorType 
              }
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }

    // 自定义性能指标
    this.monitorPageLoadTime();
    this.monitorResourceLoading();
  }

  private initializeUserAnalytics() {
    // 页面浏览追踪
    this.trackPageView();

    // 用户交互追踪
    this.trackUserInteractions();

    // 会话时长追踪
    this.trackSessionDuration();
  }

  private getPerformanceRating(metric: string, value: number): string {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private monitorPageLoadTime() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.reportPerformanceMetric({
              name: 'page_load_time',
              value: navigation.loadEventEnd - navigation.fetchStart,
              unit: 'ms',
              timestamp: Date.now()
            });
          }
        }, 0);
      });
    }
  }

  private monitorResourceLoading() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.reportPerformanceMetric({
              name: 'resource_load_time',
              value: resourceEntry.responseEnd - resourceEntry.fetchStart,
              unit: 'ms',
              timestamp: Date.now(),
              tags: {
                resource_type: resourceEntry.initiatorType,
                resource_name: resourceEntry.name
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private trackPageView() {
    if (typeof window !== 'undefined') {
      this.sendAnalyticsEvent('page_view', {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
    }
  }

  private trackUserInteractions() {
    if (typeof window !== 'undefined') {
      // 点击事件追踪
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'A' || target.tagName === 'BUTTON') {
          this.sendAnalyticsEvent('click', {
            element: target.tagName.toLowerCase(),
            text: target.textContent?.slice(0, 100),
            href: target.getAttribute('href'),
            timestamp: Date.now(),
            sessionId: this.sessionId
          });
        }
      });

      // 滚动深度追踪
      let maxScrollDepth = 0;
      window.addEventListener('scroll', () => {
        const scrollDepth = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
          maxScrollDepth = scrollDepth;
          this.sendAnalyticsEvent('scroll_depth', {
            depth: scrollDepth,
            timestamp: Date.now(),
            sessionId: this.sessionId
          });
        }
      });
    }
  }

  private trackSessionDuration() {
    if (typeof window !== 'undefined') {
      const sessionStart = Date.now();
      
      window.addEventListener('beforeunload', () => {
        const sessionDuration = Date.now() - sessionStart;
        this.sendAnalyticsEvent('session_end', {
          duration: sessionDuration,
          timestamp: Date.now(),
          sessionId: this.sessionId
        });
      });
    }
  }

  public reportError(error: ErrorReport) {
    if (!this.config.enableErrorTracking) return;

    // 采样率控制
    if (Math.random() > this.config.sampleRate) return;

    // 发送到错误追踪服务
    this.sendToErrorTrackingService(error);
    
    // 开发环境下也输出到控制台
    if (this.config.environment === 'development') {
      console.error('Monitoring Error:', error);
    }
  }

  public reportPerformanceMetric(metric: PerformanceMetric) {
    if (!this.config.enablePerformanceMonitoring) return;

    // 发送到性能监控服务
    this.sendToPerformanceService(metric);
    
    // 开发环境下也输出到控制台
    if (this.config.environment === 'development') {
      console.log('Performance Metric:', metric);
    }
  }

  private sendAnalyticsEvent(eventName: string, data: any) {
    if (!this.config.enableUserAnalytics) return;

    // 发送到分析服务
    this.sendToAnalyticsService(eventName, data);
    
    // 开发环境下也输出到控制台
    if (this.config.environment === 'development') {
      console.log('Analytics Event:', eventName, data);
    }
  }

  private async sendToErrorTrackingService(error: ErrorReport) {
    try {
      // 这里可以集成Sentry、Bugsnag等错误追踪服务
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch (err) {
      console.warn('Failed to send error report:', err);
    }
  }

  private async sendToPerformanceService(metric: PerformanceMetric) {
    try {
      // 这里可以集成DataDog、New Relic等性能监控服务
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (err) {
      console.warn('Failed to send performance metric:', err);
    }
  }

  private async sendToAnalyticsService(eventName: string, data: any) {
    try {
      // 这里可以集成Google Analytics、Mixpanel等分析服务
      await fetch('/api/monitoring/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, data })
      });
    } catch (err) {
      console.warn('Failed to send analytics event:', err);
    }
  }

  public setUserId(userId: string) {
    // 设置用户ID用于错误和分析追踪
    if (typeof window !== 'undefined') {
      (window as any).__monitoring_user_id = userId;
    }
  }

  public addContextData(key: string, value: any) {
    // 添加上下文数据
    if (typeof window !== 'undefined') {
      (window as any).__monitoring_context = {
        ...(window as any).__monitoring_context,
        [key]: value
      };
    }
  }
}

// 全局监控实例
let monitoringInstance: MonitoringService | null = null;

export function initializeMonitoring(config: MonitoringConfig) {
  if (!monitoringInstance) {
    monitoringInstance = new MonitoringService(config);
  }
  return monitoringInstance;
}

export function getMonitoringInstance(): MonitoringService | null {
  return monitoringInstance;
}

// 默认配置
export const defaultMonitoringConfig: MonitoringConfig = {
  enableErrorTracking: process.env.NODE_ENV === 'production',
  enablePerformanceMonitoring: true,
  enableUserAnalytics: process.env.NODE_ENV === 'production',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV || 'development'
};