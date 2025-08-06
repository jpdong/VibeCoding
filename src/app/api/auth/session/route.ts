import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'
import { db } from '~/lib/db'
import { ErrorHandler, withErrorHandler } from '~/lib/error-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.json({ 
      success: false, 
      user: null, 
      subscription: null 
    })
  }

  // Get user subscription
  const subscription = await db.getUserSubscription(session.user.id)

  return NextResponse.json({
    success: true,
    user: session.user,
    subscription: subscription || null,
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
    }
  })
})