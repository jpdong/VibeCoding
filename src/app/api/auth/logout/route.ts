import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await auth.api.signOut({
      headers: request.headers,
    })

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Failed to logout',
        },
      },
      { status: 500 }
    )
  }
}