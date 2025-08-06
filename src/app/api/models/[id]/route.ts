import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'
import { db } from '~/lib/db'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Get specific model
    const result = await db.query(
      'SELECT * FROM models WHERE id = $1 AND available = true',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      )
    }

    const model = result.rows[0]

    // Check user access
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    let accessible = model.tier === 'free'

    if (session?.user && model.tier === 'premium') {
      const subscription = await db.getUserSubscription(session.user.id)
      accessible = subscription?.planType === 'premium' && subscription?.status === 'active'
    }

    return NextResponse.json({
      success: true,
      model: {
        ...model,
        accessible,
      },
    })
  } catch (error) {
    console.error('Get model error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get model' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // Check if user is admin (implement admin check)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, tier, available, sortOrder } = body

    // Update model
    const result = await db.query(
      `UPDATE models 
       SET name = $1, description = $2, tier = $3, available = $4, sort_order = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, description, tier, available, sortOrder, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      model: result.rows[0],
    })
  } catch (error) {
    console.error('Update model error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update model' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // Check if user is admin
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Soft delete by setting available to false
    const result = await db.query(
      'UPDATE models SET available = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Model disabled successfully',
    })
  } catch (error) {
    console.error('Delete model error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete model' },
      { status: 500 }
    )
  }
}