// Input validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  private errors: string[] = [];

  // Email validation
  validateEmail(email: string): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      this.errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
      this.errors.push('Invalid email format');
    }
    return this;
  }

  // Text input validation
  validateText(text: string, fieldName: string, minLength = 1, maxLength = 1000): this {
    if (!text || text.trim().length === 0) {
      this.errors.push(`${fieldName} is required`);
    } else {
      const trimmedText = text.trim();
      if (trimmedText.length < minLength) {
        this.errors.push(`${fieldName} must be at least ${minLength} characters long`);
      }
      if (trimmedText.length > maxLength) {
        this.errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
      }
    }
    return this;
  }

  // Model ID validation
  validateModelId(modelId: string): this {
    const validModelIds = [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'claude-3-haiku',
      'claude-3-sonnet',
      'claude-3-opus',
      'gemini-pro',
      'codellama-34b'
    ];

    if (!modelId) {
      this.errors.push('Model ID is required');
    } else if (!validModelIds.includes(modelId)) {
      this.errors.push('Invalid model ID');
    }
    return this;
  }

  // Subscription plan validation
  validatePlanType(planType: string): this {
    const validPlans = ['free', 'premium'];
    if (!planType) {
      this.errors.push('Plan type is required');
    } else if (!validPlans.includes(planType)) {
      this.errors.push('Invalid plan type');
    }
    return this;
  }

  // UUID validation
  validateUUID(uuid: string, fieldName: string): this {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuid) {
      this.errors.push(`${fieldName} is required`);
    } else if (!uuidRegex.test(uuid)) {
      this.errors.push(`Invalid ${fieldName} format`);
    }
    return this;
  }

  // Number validation
  validateNumber(num: any, fieldName: string, min?: number, max?: number): this {
    if (num === undefined || num === null) {
      this.errors.push(`${fieldName} is required`);
    } else if (typeof num !== 'number' || isNaN(num)) {
      this.errors.push(`${fieldName} must be a valid number`);
    } else {
      if (min !== undefined && num < min) {
        this.errors.push(`${fieldName} must be at least ${min}`);
      }
      if (max !== undefined && num > max) {
        this.errors.push(`${fieldName} must be no more than ${max}`);
      }
    }
    return this;
  }

  // Get validation result
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors]
    };
  }

  // Reset validator
  reset(): this {
    this.errors = [];
    return this;
  }
}

// Utility functions
export function validateChatInput(input: string): ValidationResult {
  return new Validator()
    .validateText(input, 'Message', 10, 1000)
    .getResult();
}

export function validateUserRegistration(email: string, name?: string): ValidationResult {
  const validator = new Validator().validateEmail(email);
  
  if (name) {
    validator.validateText(name, 'Name', 1, 100);
  }
  
  return validator.getResult();
}

export function validateSubscriptionRequest(planType: string, userId: string): ValidationResult {
  return new Validator()
    .validatePlanType(planType)
    .validateUUID(userId, 'User ID')
    .getResult();
}

export function validateUsageRecord(modelId: string, tokensUsed: number): ValidationResult {
  return new Validator()
    .validateModelId(modelId)
    .validateNumber(tokensUsed, 'Tokens used', 0, 1000000)
    .getResult();
}

// Sanitization functions
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  return email.trim().toLowerCase();
}

// Rate limiting helpers
export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date;
}

export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  checkLimit(
    identifier: string, 
    maxRequests: number, 
    windowMs: number
  ): RateLimitResult {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime < now) {
        this.requests.delete(key);
      }
    }

    const current = this.requests.get(identifier);
    
    if (!current || current.resetTime < now) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      
      return {
        allowed: true,
        remainingRequests: maxRequests - 1,
        resetTime: new Date(now + windowMs)
      };
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: new Date(current.resetTime)
      };
    }

    current.count++;
    
    return {
      allowed: true,
      remainingRequests: maxRequests - current.count,
      resetTime: new Date(current.resetTime)
    };
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();