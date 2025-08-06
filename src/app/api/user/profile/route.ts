import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'
import { db } from '~/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
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

    // Get full user profile with subscription
    const user = await db.getUserById(session.user.id)
    const subscription = await db.getUserSubscription(session.user.id)

    return NextResponse.json({
      success: true,
      user,
      subscription: subscription || null,
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: 'Failed to get user profile',
        },
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
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
    const { name, avatarUrl } = body

    // Update user profile
    const updatedUser = await auth.api.updateUser({
      headers: request.headers,
      body: {
        name,
        image: avatarUrl,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROFILE_UPDATE_ERROR',
          message: 'Failed to update user profile',
        },
      },
      { status: 500 }
    )
  }
}