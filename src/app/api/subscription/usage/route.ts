import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'
import { db } from '~/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'Not authenticated' 
          } 
        },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const targetDate = date ? new Date(date) : new Date()

    // Get user usage for the specified date
    const usage = await db.getUserUsage(session.user.id, targetDate)

    // Get user subscription to determine limits
    const subscription = await db.getUserSubscription(session.user.id)
    const isPremium = subscription?.planType === 'premium' && subscription?.status === 'active'

    // Calculate usage limits based on subscription
    const limits = {
      dailyRequests: isPremium ? -1 : 50, // -1 means unlimited
      dailyTokens: isPremium ? -1 : 100000,
      premiumModels: isPremium,
    }

    // Calculate total usage
    const totalRequests = usage.reduce((sum, item) => sum + item.requests_count, 0)
    const totalTokens = usage.reduce((sum, item) => sum + item.tokens_used, 0)

    // Check if user has exceeded limits
    const hasExceededRequests = limits.dailyRequests > 0 && totalRequests >= limits.dailyRequests
    const hasExceededTokens = limits.dailyTokens > 0 && totalTokens >= limits.dailyTokens

    return NextResponse.json({
      success: true,
      usage: {
        date: targetDate.toISOString().split('T')[0],
        totalRequests,
        totalTokens,
        modelUsage: usage,
        limits,
        hasExceededRequests,
        hasExceededTokens,
        canMakeRequest: !hasExceededRequests && !hasExceededTokens,
      },
      subscription: {
        planType: subscription?.planType || 'free',
        status: subscription?.status || 'active',
        isPremium,
      },
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'USAGE_ERROR',
          message: 'Failed to get usage information',
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'Not authenticated' 
          } 
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { modelId, tokensUsed } = body

    if (!modelId || typeof tokensUsed !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'Model ID and tokens used are required',
          },
        },
        { status: 400 }
      )
    }

    // Record usage
    await db.recordUsage(session.user.id, modelId, tokensUsed)

    return NextResponse.json({
      success: true,
      message: 'Usage recorded successfully',
    })
  } catch (error) {
    console.error('Record usage error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RECORD_USAGE_ERROR',
          message: 'Failed to record usage',
        },
      },
      { status: 500 }
    )
  }
}