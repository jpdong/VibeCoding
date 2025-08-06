import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { redirectTo } = body

    // Create Google OAuth URL
    const url = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: redirectTo || '/',
      },
    })

    return NextResponse.json({
      success: true,
      url: url.url,
    })
  } catch (error) {
    console.error('Google login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GOOGLE_LOGIN_ERROR',
          message: 'Failed to initiate Google login',
        },
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Handle Google OAuth callback
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
    }

    // Exchange code for tokens and create session
    const result = await auth.api.signInSocial({
      body: {
        provider: 'google',
        code,
        state,
      },
    })

    if (result.error) {
      return NextResponse.redirect(
        new URL(`/?error=${result.error.message}`, request.url)
      )
    }

    // Redirect to success page or original destination
    const redirectTo = state ? decodeURIComponent(state) : '/'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/?error=oauth_callback_failed', request.url)
    )
  }
}