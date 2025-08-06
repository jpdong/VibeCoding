import { Pool, PoolClient } from 'pg'

// Create a global connection pool
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
  }

  return pool
}

export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

// Helper function to close the pool (useful for testing)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Database helper functions
export const db = {
  // User operations
  async getUserById(id: string) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0]
  },

  async getUserByEmail(email: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0]
  },

  async createUser(userData: {
    email: string
    name?: string
    avatarUrl?: string
    googleId?: string
  }) {
    const { email, name, avatarUrl, googleId } = userData
    const result = await query(
      `INSERT INTO users (email, name, avatar_url, google_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [email, name, avatarUrl, googleId]
    )
    return result.rows[0]
  },

  // Subscription operations
  async getUserSubscription(userId: string) {
    const result = await query(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 AND status = 'active' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    )
    return result.rows[0]
  },

  async createSubscription(subscriptionData: {
    userId: string
    planType: 'free' | 'premium'
    status?: string
    expiresAt?: Date
  }) {
    const { userId, planType, status = 'active', expiresAt } = subscriptionData
    const result = await query(
      `INSERT INTO subscriptions (user_id, plan_type, status, expires_at) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, planType, status, expiresAt]
    )
    return result.rows[0]
  },

  // Model operations
  async getAvailableModels() {
    const result = await query(
      `SELECT * FROM models 
       WHERE available = true 
       ORDER BY sort_order ASC, name ASC`
    )
    return result.rows
  },

  async getModelsByTier(tier: 'free' | 'premium') {
    const result = await query(
      `SELECT * FROM models 
       WHERE available = true AND tier = $1 
       ORDER BY sort_order ASC, name ASC`,
      [tier]
    )
    return result.rows
  },

  // Usage tracking
  async recordUsage(userId: string, modelId: string, tokensUsed: number) {
    await query(
      `INSERT INTO user_usage (user_id, model_id, tokens_used) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, model_id, date) 
       DO UPDATE SET 
         tokens_used = user_usage.tokens_used + $3,
         requests_count = user_usage.requests_count + 1`,
      [userId, modelId, tokensUsed]
    )
  },

  async getUserUsage(userId: string, date?: Date) {
    const targetDate = date || new Date()
    const result = await query(
      `SELECT model_id, tokens_used, requests_count 
       FROM user_usage 
       WHERE user_id = $1 AND date = $2`,
      [userId, targetDate.toISOString().split('T')[0]]
    )
    return result.rows
  }
}