import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'
import { db } from '~/lib/db'

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

    // Get user's current subscription
    const subscription = await db.getUserSubscription(session.user.id)

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No active subscription found',
          },
        },
        { status: 404 }
      )
    }

    // For free subscriptions, just return success
    if (subscription.planType === 'free') {
      return NextResponse.json({
        success: true,
        message: 'Free subscription cannot be cancelled',
        subscription,
      })
    }

    // For premium subscriptions, return "Coming Soon" message
    return NextResponse.json({
      success: false,
      error: {
        code: 'COMING_SOON',
        message: 'Subscription management is coming soon! Please contact support for assistance.',
        details: {
          supportEmail: 'support@vibecoding.com',
          currentPlan: subscription.planType,
          status: subscription.status,
        }
      },
    })

    // This code will be used when payment integration is ready
    /*
    if (subscription.planType === 'premium' && subscription.stripeSubscriptionId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16',
      })

      // Cancel Stripe subscription
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })

      // Update subscription in database
      await db.query(
        'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2',
        ['cancelled', subscription.id]
      )

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully. You will retain access until the end of your billing period.',
        subscription: {
          ...subscription,
          status: 'cancelled',
        },
      })
    }
    */

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUBSCRIPTION_CANCEL_ERROR',
          message: 'Failed to cancel subscription',
        },
      },
      { status: 500 }
    )
  }
}