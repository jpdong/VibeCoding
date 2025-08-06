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

    // Get user subscription
    const subscription = await db.getUserSubscription(session.user.id)

    if (!subscription) {
      // Create default free subscription if none exists
      const newSubscription = await db.createSubscription({
        userId: session.user.id,
        planType: 'free',
        status: 'active',
      })

      return NextResponse.json({
        success: true,
        subscription: newSubscription,
        isActive: true,
        isPremium: false,
        daysRemaining: null,
      })
    }

    // Check if subscription is expired
    const now = new Date()
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now
    const isActive = subscription.status === 'active' && !isExpired

    // Calculate days remaining for premium subscriptions
    let daysRemaining = null
    if (subscription.planType === 'premium' && subscription.expiresAt && isActive) {
      const expiryDate = new Date(subscription.expiresAt)
      const diffTime = expiryDate.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // Update subscription status if expired
    if (isExpired && subscription.status === 'active') {
      await db.query(
        'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2',
        ['expired', subscription.id]
      )
      subscription.status = 'expired'
    }

    return NextResponse.json({
      success: true,
      subscription,
      isActive: isActive && !isExpired,
      isPremium: subscription.planType === 'premium' && isActive && !isExpired,
      daysRemaining,
      isExpired,
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUBSCRIPTION_ERROR',
          message: 'Failed to get subscription status',
        },
      },
      { status: 500 }
    )
  }
}