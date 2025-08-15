import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription } from '~/servers/subscription';
import { getUsageInfo } from '~/servers/usageTracking';
import { getUserById } from '~/servers/user';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Get client IP for guest users
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    let user = null;
    let subscription = null;

    if (userId) {
      // 验证用户存在
      user = await getUserById(userId);
      if (user.status === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // 获取订阅信息
      subscription = await getUserSubscription(userId);
    }
    
    // 获取使用信息 (支持未登录用户)
    const usageInfo = await getUsageInfo(userId, clientIP);
    
    return NextResponse.json({
      success: true,
      data: {
        subscription,
        usage: usageInfo,
        user: user ? {
          currentPlan: user.current_plan || 'free',
          subscriptionStatus: user.subscription_status || 'active'
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}