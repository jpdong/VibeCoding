import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'
import { db } from '~/lib/db'
import { Model } from '~/types/auth'
import { ErrorHandler, withErrorHandler } from '~/lib/error-handler'
import { globalRateLimiter } from '~/lib/validation'

// Cache for models data
let modelsCache: { data: Model[]; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Rate limiting
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = globalRateLimiter.checkLimit(
    `models:${clientIP}`,
    100, // 100 requests
    60 * 1000 // per minute
  );

  if (!rateLimitResult.allowed) {
    throw ErrorHandler.rateLimitExceeded('Too many requests to models API');
  }

  // Check cache first
  const now = Date.now()
  if (modelsCache && (now - modelsCache.timestamp) < CACHE_DURATION) {
    return filterModelsForUser(request, modelsCache.data)
  }

  // Fetch models from database
  const models = await db.getAvailableModels()
  
  // Update cache
  modelsCache = {
    data: models,
    timestamp: now,
  }

  return filterModelsForUser(request, models)
})

async function filterModelsForUser(request: NextRequest, models: Model[]) {
  try {
    // Get user session to determine access level
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    let userTier: 'free' | 'premium' = 'free'
    
    if (session?.user) {
      // Check user subscription
      const subscription = await db.getUserSubscription(session.user.id)
      if (subscription?.planType === 'premium' && subscription?.status === 'active') {
        userTier = 'premium'
      }
    }

    // Filter models based on user tier
    const accessibleModels = models.map(model => ({
      ...model,
      accessible: userTier === 'premium' || model.tier === 'free',
    }))

    return NextResponse.json({
      success: true,
      models: accessibleModels,
      userTier,
      isAuthenticated: !!session?.user,
    })
  } catch (error) {
    console.error('Error filtering models for user:', error)
    
    // Return all models with accessibility info if error occurs
    const modelsWithAccess = models.map(model => ({
      ...model,
      accessible: model.tier === 'free', // Default to free access only
    }))

    return NextResponse.json({
      success: true,
      models: modelsWithAccess,
      userTier: 'free',
      isAuthenticated: false,
    })
  }
}

function getFallbackModels(): Model[] {
  return [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most coding tasks',
      provider: 'openai',
      tier: 'free',
      available: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable model for complex coding problems',
      provider: 'openai',
      tier: 'premium',
      available: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Fast and lightweight Claude model',
      provider: 'anthropic',
      tier: 'free',
      available: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      description: 'Balanced Claude model for coding',
      provider: 'anthropic',
      tier: 'premium',
      available: true,
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]
}

// Admin endpoint to refresh models cache
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin (you can implement admin check here)
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clear cache to force refresh
    modelsCache = null

    return NextResponse.json({
      success: true,
      message: 'Models cache cleared',
    })
  } catch (error) {
    console.error('Clear models cache error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}