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

    const body = await request.json()
    const { planType, paymentMethodId } = body

    // Validate plan type
    if (!['free', 'premium'].includes(planType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLAN',
            message: 'Invalid plan type',
          },
        },
        { status: 400 }
      )
    }

    // For now, return "Coming Soon" message for premium subscriptions
    if (planType === 'premium') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'COMING_SOON',
          message: 'Premium subscriptions are coming soon! We\'re working hard to bring you this feature.',
          details: {
            expectedLaunch: 'Q2 2024',
            features: [
              'Access to all premium AI models',
              'Unlimited usage',
              'Priority support',
              'Advanced code analysis',
              'Export conversations'
            ]
          }
        },
      })
    }

    // Handle free subscription creation
    if (planType === 'free') {
      // Check if user already has a subscription
      const existingSubscription = await db.getUserSubscription(session.user.id)
      
      if (existingSubscription) {
        return NextResponse.json({
          success: true,
          subscription: existingSubscription,
          message: 'Free subscription already active',
        })
      }

      // Create free subscription
      const subscription = await db.createSubscription({
        userId: session.user.id,
        planType: 'free',
        status: 'active',
      })

      return NextResponse.json({
        success: true,
        subscription,
        message: 'Free subscription created successfully',
      })
    }

    // This code will be used when payment integration is ready
    /*
    // Create Stripe customer and subscription
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    })

    // Create or get customer
    let customer
    const existingCustomer = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })

    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0]
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: {
          userId: session.user.id,
        },
      })
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    })

    // Create subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
        },
      ],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    })

    // Save subscription to database
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month from now

    const subscription = await db.createSubscription({
      userId: session.user.id,
      planType: 'premium',
      status: 'active',
      expiresAt,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: customer.id,
    })

    return NextResponse.json({
      success: true,
      subscription,
      stripeSubscription,
    })
    */

  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUBSCRIPTION_CREATE_ERROR',
          message: 'Failed to create subscription',
        },
      },
      { status: 500 }
    )
  }
}