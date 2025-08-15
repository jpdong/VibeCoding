import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '~/libs/db';

const db = getDb();

export async function POST(request: NextRequest) {
  try {
    // 仅在开发环境允许重置
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Reset only allowed in development' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const all = searchParams.get('all') === 'true';
    
    if (all) {
      // 重置所有用量
      await db.query('DELETE FROM daily_usage');
      console.log('All usage data reset');
    } else if (userId) {
      // 重置特定用户的用量
      await db.query('DELETE FROM daily_usage WHERE user_id = $1', [userId]);
      console.log(`Usage data reset for user: ${userId}`);
    } else {
      // 重置今天的数据
      const today = new Date().toISOString().split('T')[0];
      await db.query('DELETE FROM daily_usage WHERE usage_date = $1', [today]);
      console.log(`Usage data reset for today: ${today}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Usage data reset successfully'
    });
  } catch (error) {
    console.error('Error resetting usage data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset usage data' },
      { status: 500 }
    );
  }
}