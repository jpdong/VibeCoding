import { NextRequest, NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ApiError) {
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code 
          },
          { status: error.statusCode }
        );
      }
      
      // 未知错误
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

export function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export function withCache(response: NextResponse, maxAge: number = 300): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  return response;
}

export function validatePagination(page?: string, limit?: string) {
  const pageNum = parseInt(page || '1');
  const limitNum = parseInt(limit || '10');
  
  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError(400, 'Invalid page number');
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ApiError(400, 'Invalid limit (must be between 1 and 100)');
  }
  
  return { page: pageNum, limit: limitNum };
}

export function validateLocale(locale?: string): string {
  const validLocales = ['en', 'zh'];
  const normalizedLocale = locale || 'en';
  
  if (!validLocales.includes(normalizedLocale)) {
    throw new ApiError(400, `Invalid locale. Must be one of: ${validLocales.join(', ')}`);
  }
  
  return normalizedLocale;
}