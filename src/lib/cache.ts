// 缓存管理工具

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl = 300000): void { // 默认5分钟
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 清理过期项
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 全局缓存实例
export const memoryCache = new MemoryCache(200);

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 60000); // 每分钟清理一次
}

// 本地存储缓存
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix = 'blog_cache_') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl = 3600000): void { // 默认1小时
    if (typeof window === 'undefined') return;

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      
      if (!itemStr) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(itemStr);

      // 检查是否过期
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // 清理过期项
  cleanup(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (now - item.timestamp > item.ttl) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // 如果解析失败，删除该项
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// 全局本地存储缓存实例
export const localStorageCache = new LocalStorageCache();

// 缓存装饰器
export function cached<T extends (...args: any[]) => any>(
  ttl = 300000, // 5分钟
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `${propertyName}_${JSON.stringify(args)}`;

      // 先检查内存缓存
      let cached = memoryCache.get<ReturnType<T>>(key);
      if (cached !== null) {
        return cached;
      }

      // 再检查本地存储缓存
      cached = localStorageCache.get<ReturnType<T>>(key);
      if (cached !== null) {
        // 同时存储到内存缓存
        memoryCache.set(key, cached, ttl);
        return cached;
      }

      // 执行原方法
      const result = await method.apply(this, args);

      // 缓存结果
      memoryCache.set(key, result, ttl);
      localStorageCache.set(key, result, ttl);

      return result;
    };
  };
}

// API 响应缓存
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl = 300000
): Promise<T> {
  const key = `fetch_${url}_${JSON.stringify(options)}`;
  
  // 检查缓存
  let cached = memoryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // 发起请求
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // 缓存结果
  memoryCache.set(key, data, ttl);
  
  return data;
}

// 图片预加载缓存
export class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private loading = new Set<string>();

  async preload(src: string): Promise<HTMLImageElement> {
    // 如果已经缓存，直接返回
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    // 如果正在加载，等待加载完成
    if (this.loading.has(src)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.cache.has(src)) {
            resolve(this.cache.get(src)!);
          } else {
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
      });
    }

    // 开始加载
    this.loading.add(src);

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loading.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        this.loading.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }

  has(src: string): boolean {
    return this.cache.has(src);
  }

  get(src: string): HTMLImageElement | undefined {
    return this.cache.get(src);
  }

  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }
}

// 全局图片缓存实例
export const imageCache = new ImageCache();

// 初始化缓存清理
if (typeof window !== 'undefined') {
  // 页面加载时清理过期的本地存储缓存
  window.addEventListener('load', () => {
    localStorageCache.cleanup();
  });

  // 页面卸载时清理内存缓存
  window.addEventListener('beforeunload', () => {
    memoryCache.clear();
  });
}