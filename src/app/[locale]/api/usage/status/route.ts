import { NextRequest, NextResponse } from 'next/server';
import { getUsageInfo } from '~/servers/usageTracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Get client IP for guest users
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const usageInfo = await getUsageInfo(userId, clientIP);
    
    return NextResponse.json({
      success: true,
      data: usageInfo
    });
  } catch (error) {
    console.error('Error fetching usage status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage status' },
      { status: 500 }
    );
  }
}