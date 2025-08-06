// Centralized error handling utilities

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  TURNSTILE_ERROR = 'TURNSTILE_ERROR',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode: number;
  timestamp: Date;
  requestId?: string;
}

export class ErrorHandler {
  static createError(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any
  ): AppError {
    return {
      code,
      message,
      details,
      statusCode,
      timestamp: new Date(),
    };
  }

  // Authentication errors
  static unauthorized(message = 'Authentication required'): AppError {
    return this.createError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static invalidCredentials(message = 'Invalid credentials'): AppError {
    return this.createError(ErrorCode.INVALID_CREDENTIALS, message, 401);
  }

  static sessionExpired(message = 'Session has expired'): AppError {
    return this.createError(ErrorCode.SESSION_EXPIRED, message, 401);
  }

  // Authorization errors
  static forbidden(message = 'Access denied'): AppError {
    return this.createError(ErrorCode.FORBIDDEN, message, 403);
  }

  static subscriptionRequired(message = 'Premium subscription required'): AppError {
    return this.createError(ErrorCode.SUBSCRIPTION_REQUIRED, message, 403);
  }

  // Validation errors
  static invalidInput(message: string, details?: any): AppError {
    return this.createError(ErrorCode.INVALID_INPUT, message, 400, details);
  }

  static missingField(fieldName: string): AppError {
    return this.createError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      `Missing required field: ${fieldName}`,
      400
    );
  }

  // Resource e  // 
Resource errors
  static notFound(resource = 'Resource'): AppError {
    return this.createError(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
  }

  static alreadyExists(resource = 'Resource'): AppError {
    return this.createError(ErrorCode.ALREADY_EXISTS, `${resource} already exists`, 409);
  }

  static resourceUnavailable(message = 'Resource temporarily unavailable'): AppError {
    return this.createError(ErrorCode.RESOURCE_UNAVAILABLE, message, 503);
  }

  // Rate limiting errors
  static rateLimitExceeded(message = 'Rate limit exceeded'): AppError {
    return this.createError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
  }

  static quotaExceeded(message = 'Usage quota exceeded'): AppError {
    return this.createError(ErrorCode.QUOTA_EXCEEDED, message, 429);
  }

  // External service errors
  static externalServiceError(service: string, details?: any): AppError {
    return this.createError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `External service error: ${service}`,
      502,
      details
    );
  }

  static turnstileError(message = 'Security verification failed'): AppError {
    return this.createError(ErrorCode.TURNSTILE_ERROR, message, 403);
  }

  // System errors
  static internalError(message = 'Internal server error', details?: any): AppError {
    return this.createError(ErrorCode.INTERNAL_ERROR, message, 500, details);
  }

  static databaseError(message = 'Database operation failed', details?: any): AppError {
    return this.createError(ErrorCode.DATABASE_ERROR, message, 500, details);
  }

  static networkError(message = 'Network error occurred'): AppError {
    return this.createError(ErrorCode.NETWORK_ERROR, message, 502);
  }

  // Error response formatter
  static formatErrorResponse(error: AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp.toISOString(),
      },
    };
  }

  // Log error (in production, this would integrate with logging service)
  static logError(error: AppError, context?: any) {
    console.error('Application Error:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: error.timestamp,
      context,
    });
  }

  // Handle different error types
  static handleError(error: any): AppError {
    // If it's already an AppError, return as is
    if (error.code && error.statusCode) {
      return error as AppError;
    }

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return this.invalidInput(error.message, error.details);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return this.networkError('Network connection failed');
    }

    if (error.code === '23505') { // PostgreSQL unique violation
      return this.alreadyExists('Record');
    }

    if (error.code === '23503') { // PostgreSQL foreign key violation
      return this.invalidInput('Invalid reference to related resource');
    }

    // Default to internal error
    return this.internalError(error.message || 'An unexpected error occurred', {
      originalError: error.message,
      stack: error.stack,
    });
  }
}

// Middleware for handling errors in API routes
export function withErrorHandler(handler: Function) {
  return async (req: any, res: any) => {
    try {
      return await handler(req, res);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, { url: req.url, method: req.method });
      
      return new Response(
        JSON.stringify(ErrorHandler.formatErrorResponse(appError)),
        {
          status: appError.statusCode,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}

// Client-side error handler
export class ClientErrorHandler {
  static handleApiError(response: any, commonText: any = {}) {
    if (!response.success && response.error) {
      const { code, message } = response.error;
      
      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        [ErrorCode.UNAUTHORIZED]: commonText.authenticationError || 'Please log in to continue',
        [ErrorCode.SESSION_EXPIRED]: commonText.sessionExpired || 'Your session has expired. Please log in again',
        [ErrorCode.SUBSCRIPTION_REQUIRED]: commonText.subscriptionRequired || 'This feature requires a premium subscription',
        [ErrorCode.RATE_LIMIT_EXCEEDED]: commonText.rateLimitExceeded || 'Too many requests. Please try again later',
        [ErrorCode.QUOTA_EXCEEDED]: commonText.quotaExceeded || 'Usage limit reached. Please upgrade your plan',
        [ErrorCode.INVALID_INPUT]: message, // Use the specific validation message
        [ErrorCode.NOT_FOUND]: commonText.notFound || 'The requested resource was not found',
        [ErrorCode.NETWORK_ERROR]: commonText.networkError || 'Network error. Please check your connection',
        [ErrorCode.INTERNAL_ERROR]: commonText.internalError || 'An unexpected error occurred. Please try again',
      };

      return errorMessages[code] || message || 'An error occurred';
    }

    return 'An unexpected error occurred';
  }

  static isRetryableError(errorCode: ErrorCode): boolean {
    const retryableErrors = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      ErrorCode.INTERNAL_ERROR,
      ErrorCode.DATABASE_ERROR,
    ];

    return retryableErrors.includes(errorCode);
  }
}