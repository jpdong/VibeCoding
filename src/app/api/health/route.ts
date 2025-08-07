import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '~/lib/blog';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // 基本健康检查
    const healthData = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {} as Record<string, any>,
      responseTime: 0
    };

    // 数据库连接检查（通过尝试获取博客文章）
    try {
      const posts = await getAllBlogPosts('en');
      healthData.checks.database = {
        status: 'healthy',
        message: `Found ${posts.length} blog posts`,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      healthData.checks.database = {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Database connection failed',
        responseTime: Date.now() - startTime
      };
      healthData.status = 'degraded';
    }

    // 文件系统检查
    try {
      const fs = require('fs');
      const contentPath = 'content/blog';
      
      if (fs.existsSync(contentPath)) {
        healthData.checks.filesystem = {
          status: 'healthy',
          message: 'Content directory accessible'
        };
      } else {
        healthData.checks.filesystem = {
          status: 'warning',
          message: 'Content directory not found'
        };
      }
    } catch (error) {
      healthData.checks.filesystem = {
        status: 'unhealthy',
        message: 'Filesystem check failed'
      };
      healthData.status = 'degraded';
    }

    // 环境变量检查
    const requiredEnvVars = [
      'NEXT_PUBLIC_SITE_URL',
      'DATABASE_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length === 0) {
      healthData.checks.environment = {
        status: 'healthy',
        message: 'All required environment variables are set'
      };
    } else {
      healthData.checks.environment = {
        status: 'warning',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`
      };
      if (healthData.status === 'healthy') {
        healthData.status = 'degraded';
      }
    }

    // 内存使用检查
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (memoryUsagePercent < 80) {
      healthData.checks.memory = {
        status: 'healthy',
        message: `Memory usage: ${Math.round(memoryUsagePercent)}%`
      };
    } else if (memoryUsagePercent < 95) {
      healthData.checks.memory = {
        status: 'warning',
        message: `High memory usage: ${Math.round(memoryUsagePercent)}%`
      };
      if (healthData.status === 'healthy') {
        healthData.status = 'degraded';
      }
    } else {
      healthData.checks.memory = {
        status: 'unhealthy',
        message: `Critical memory usage: ${Math.round(memoryUsagePercent)}%`
      };
      healthData.status = 'unhealthy';
    }

    // 响应时间检查
    const responseTime = Date.now() - startTime;
    healthData.responseTime = responseTime;
    
    if (responseTime > 5000) {
      healthData.status = 'degraded';
    }

    // 根据整体状态返回适当的HTTP状态码
    const httpStatus = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthData, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    };

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// 简化的健康检查端点
export async function HEAD() {
  try {
    // 快速检查，只返回状态码
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}