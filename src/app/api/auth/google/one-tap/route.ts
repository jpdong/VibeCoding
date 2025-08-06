import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credential } = body

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CREDENTIAL',
            message: 'Google credential is required',
          },
        },
        { status: 400 }
      )
    }

    // Decode the JWT token from Google
    const decoded = jwt.decode(credential) as any

    if (!decoded || !decoded.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIAL',
            message: 'Invalid Google credential',
          },
        },
        { status: 400 }
      )
    }

    // Verify the token with Google (in production, you should verify the signature)
    // For now, we'll trust the decoded token since it comes from Google's One-Tap

    const userData = {
      email: decoded.email,
      name: decoded.name,
      avatarUrl: decoded.picture,
      googleId: decoded.sub,
      emailVerified: decoded.email_verified || false,
    }

    // Create or update user using BetterAuth
    const result = await auth.api.signInSocial({
      body: {
        provider: 'google',
        idToken: credential,
      },
    })

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: result.error.message,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
    })
  } catch (error) {
    console.error('Google One-Tap error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ONE_TAP_ERROR',
          message: 'Failed to process Google One-Tap login',
        },
      },
      { status: 500 }
    )
  }
}