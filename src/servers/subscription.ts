import { getDb } from "~/libs/db";

const db = getDb();

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  dailyLimit: number;
  features: Record<string, any>;
}

export interface UserSubscription {
  id: number;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  creemSubscriptionId?: string;
}

/**
 * 获取所有可用的订阅计划
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const result = await db.query(`
    SELECT plan_id, name, price, currency, daily_limit, features
    FROM subscription_plans
    WHERE is_active = true
    ORDER BY price ASC
  `);
  
  return result.rows.map(row => ({
    id: row.plan_id,
    name: row.name,
    price: parseFloat(row.price),
    currency: row.currency,
    dailyLimit: row.daily_limit,
    features: row.features || {}
  }));
};

/**
 * 获取用户当前订阅
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const result = await db.query(`
    SELECT id, user_id, plan_id, status, current_period_start, current_period_end,
           cancel_at_period_end, creem_subscription_id
    FROM user_subscriptions
    WHERE user_id = $1 AND status IN ('active', 'trialing', 'past_due')
    ORDER BY created_at DESC
    LIMIT 1
  `, [userId]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    creemSubscriptionId: row.creem_subscription_id
  };
};

/**
 * 创建用户订阅
 */
export const createUserSubscription = async (
  userId: string,
  planId: string,
  creemSubscriptionId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<UserSubscription> => {
  const result = await db.query(`
    INSERT INTO user_subscriptions (
      user_id, plan_id, creem_subscription_id, status,
      current_period_start, current_period_end
    )
    VALUES ($1, $2, $3, 'active', $4, $5)
    RETURNING *
  `, [userId, planId, creemSubscriptionId, periodStart, periodEnd]);
  
  // 更新用户信息表
  await db.query(`
    UPDATE user_info 
    SET current_plan = $1, subscription_status = 'active', updated_at = NOW()
    WHERE user_id = $2
  `, [planId, userId]);
  
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    creemSubscriptionId: row.creem_subscription_id
  };
};

/**
 * 根据Creem订阅ID获取用户订阅
 */
export const getUserSubscriptionByCreemId = async (creemSubscriptionId: string): Promise<UserSubscription | null> => {
  const result = await db.query(`
    SELECT id, user_id, plan_id, status, current_period_start, current_period_end,
           cancel_at_period_end, creem_subscription_id
    FROM user_subscriptions
    WHERE creem_subscription_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `, [creemSubscriptionId]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    creemSubscriptionId: row.creem_subscription_id
  };
};

/**
 * 更新订阅状态
 */
export const updateSubscriptionStatus = async (
  creemSubscriptionId: string,
  status: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<void> => {
  let query = `
    UPDATE user_subscriptions 
    SET status = $1, updated_at = NOW()
  `;
  let params = [status, creemSubscriptionId];
  
  if (periodStart && periodEnd) {
    query += `, current_period_start = $3, current_period_end = $4`;
    params.push(periodStart.toISOString(), periodEnd.toISOString());
  }
  
  query += ` WHERE creem_subscription_id = $${params.length}`;
  
  await db.query(query, params);
  
  // 更新用户信息表
  const userResult = await db.query(`
    SELECT user_id, plan_id FROM user_subscriptions 
    WHERE creem_subscription_id = $1
  `, [creemSubscriptionId]);
  
  if (userResult.rows.length > 0) {
    const { user_id, plan_id } = userResult.rows[0];
    const userPlan = status === 'active' ? plan_id : 'free';
    
    await db.query(`
      UPDATE user_info 
      SET current_plan = $1, subscription_status = $2, updated_at = NOW()
      WHERE user_id = $3
    `, [userPlan, status, user_id]);
  }
};

/**
 * 取消订阅（标记为在周期结束时取消）
 */
export const cancelSubscription = async (userId: string): Promise<boolean> => {
  const result = await db.query(`
    UPDATE user_subscriptions 
    SET cancel_at_period_end = true, updated_at = NOW()
    WHERE user_id = $1 AND status = 'active'
    RETURNING creem_subscription_id
  `, [userId]);
  
  return result.rows.length > 0;
};

/**
 * 记录支付
 */
export const recordPayment = async (
  userId: string,
  creemPaymentId: string,
  subscriptionId: number,
  amount: number,
  currency: string,
  status: string,
  paymentMethod?: string
): Promise<void> => {
  await db.query(`
    INSERT INTO payment_records (
      user_id, creem_payment_id, subscription_id, amount, 
      currency, status, payment_method
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [userId, creemPaymentId, subscriptionId, amount, currency, status, paymentMethod]);
};