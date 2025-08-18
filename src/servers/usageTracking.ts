import { getDb } from "~/libs/db";

const db = getDb();

export interface UsageLimit {
  guest: number;
  free: number;
  premium: number;
}

const DAILY_LIMITS: UsageLimit = {
  guest: 10,
  free: 20,
  premium: 50
};

export type UserType = 'guest' | 'free' | 'premium';

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  userType: UserType;
  canUse: boolean;
}

/**
 * 获取用户类型
 */
export const getUserType = async (userId?: string): Promise<UserType> => {
  if (!userId) return 'guest';
  
  const result = await db.query(
    'SELECT current_plan, subscription_status FROM user_info WHERE user_id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) return 'guest';
  
  const { current_plan, subscription_status } = result.rows[0];
  
  if (current_plan === 'premium' && subscription_status === 'active') {
    return 'premium';
  }
  
  return 'free';
};

/**
 * 获取用户今日使用次数
 */
export const getTodayUsage = async (userId?: string, ipAddress?: string): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  
  let query: string;
  let params: any[];
  
  if (userId) {
    query = 'SELECT usage_count FROM daily_usage WHERE user_id = $1 AND usage_date = $2';
    params = [userId, today];
  } else {
    query = 'SELECT usage_count FROM daily_usage WHERE ip_address = $1 AND usage_date = $2 AND user_id IS NULL';
    params = [ipAddress, today];
  }
  
  const result = await db.query(query, params);
  return result.rows.length > 0 ? result.rows[0].usage_count : 0;
};

/**
 * 获取用户使用信息
 */
export const getUsageInfo = async (userId?: string, ipAddress?: string): Promise<UsageInfo> => {
  const userType = await getUserType(userId);
  const used = await getTodayUsage(userId, ipAddress);
  const limit = DAILY_LIMITS[userType];
  
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    userType,
    canUse: used < limit
  };
};

/**
 * 增加使用次数
 */
export const incrementUsage = async (userId?: string, ipAddress?: string): Promise<boolean> => {
  const usageInfo = await getUsageInfo(userId, ipAddress);
  
  if (!usageInfo.canUse) {
    return false;
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  if (userId) {
    // 登录用户 - 先尝试查找现有记录
    const existingRecord = await db.query(
      'SELECT id, usage_count FROM daily_usage WHERE user_id = $1 AND usage_date = $2',
      [userId, today]
    );
    
    if (existingRecord.rows.length > 0) {
      // 更新现有记录
      await db.query(
        'UPDATE daily_usage SET usage_count = usage_count + 1, updated_at = NOW() WHERE user_id = $1 AND usage_date = $2',
        [userId, today]
      );
    } else {
      // 插入新记录
      await db.query(
        'INSERT INTO daily_usage (user_id, usage_date, usage_count, user_type) VALUES ($1, $2, 1, $3)',
        [userId, today, usageInfo.userType]
      );
    }
  } else {
    // 未登录用户
    const existingRecord = await db.query(
      'SELECT id, usage_count FROM daily_usage WHERE ip_address = $1 AND usage_date = $2 AND user_id IS NULL',
      [ipAddress, today]
    );
    
    if (existingRecord.rows.length > 0) {
      // 更新现有记录
      await db.query(
        'UPDATE daily_usage SET usage_count = usage_count + 1, updated_at = NOW() WHERE ip_address = $1 AND usage_date = $2 AND user_id IS NULL',
        [ipAddress, today]
      );
    } else {
      // 插入新记录
      await db.query(
        'INSERT INTO daily_usage (ip_address, usage_date, usage_count, user_type) VALUES ($1, $2, 1, $3)',
        [ipAddress, today, 'guest']
      );
    }
  }
  
  return true;
};

/**
 * 检查用户是否可以使用服务
 */
export const canUserUseService = async (userId?: string, ipAddress?: string): Promise<{ canUse: boolean; usageInfo: UsageInfo }> => {
  const usageInfo = await getUsageInfo(userId, ipAddress);
  
  return {
    canUse: usageInfo.canUse,
    usageInfo
  };
};

/**
 * 重置每日使用次数（定时任务用）
 */
export const resetDailyUsage = async (): Promise<void> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // 删除7天前的数据
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  
  await db.query('DELETE FROM daily_usage WHERE usage_date < $1', [weekAgoStr]);
};