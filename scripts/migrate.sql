-- Database migration script for BetterAuth and subscription system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (BetterAuth will create this, but we'll extend it)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (BetterAuth managed)
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free' or 'premium'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(100),
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free' or 'premium'
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  max_tokens INTEGER,
  cost_per_token DECIMAL(10, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model_id VARCHAR(100) REFERENCES models(id),
  tokens_used INTEGER DEFAULT 0,
  requests_count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, model_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_models_tier ON models(tier);
CREATE INDEX IF NOT EXISTS idx_models_available ON models(available);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_date ON user_usage(date);

-- Insert default models
INSERT INTO models (id, name, description, provider, tier, available, sort_order) VALUES
  ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient for most coding tasks', 'openai', 'free', true, 1),
  ('gpt-4', 'GPT-4', 'Most capable model for complex coding problems', 'openai', 'premium', true, 2),
  ('gpt-4-turbo', 'GPT-4 Turbo', 'Latest GPT-4 with improved performance', 'openai', 'premium', true, 3),
  ('claude-3-haiku', 'Claude 3 Haiku', 'Fast and lightweight Claude model', 'anthropic', 'free', true, 4),
  ('claude-3-sonnet', 'Claude 3 Sonnet', 'Balanced Claude model for coding', 'anthropic', 'premium', true, 5),
  ('claude-3-opus', 'Claude 3 Opus', 'Most powerful Claude model', 'anthropic', 'premium', true, 6)
ON CONFLICT (id) DO NOTHING;

-- Create function to automatically create free subscription for new users
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create subscription for new users
DROP TRIGGER IF EXISTS trigger_create_user_subscription ON users;
CREATE TRIGGER trigger_create_user_subscription
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_models_updated_at ON models;
CREATE TRIGGER trigger_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();