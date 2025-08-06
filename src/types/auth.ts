// Authentication and subscription related types

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  googleId?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  startedAt: Date;
  expiresAt?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  tier: 'free' | 'premium';
  available: boolean;
  sortOrder: number;
  maxTokens?: number;
  costPerToken?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUsage {
  id: string;
  userId: string;
  modelId: string;
  tokensUsed: number;
  requestsCount: number;
  date: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  modelAccess: 'free' | 'premium' | 'all';
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Access to basic AI models',
      'Limited daily usage',
      'Community support',
      'Basic code assistance'
    ],
    modelAccess: 'free'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.9,
    currency: 'USD',
    interval: 'month',
    features: [
      'Access to all AI models',
      'Unlimited usage',
      'Priority support',
      'Advanced code assistance',
      'Code review features',
      'Export conversations'
    ],
    modelAccess: 'all',
    popular: true
  }
];

export interface LoginOptions {
  provider: 'google';
  redirectTo?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// API Response types
export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: any;
  error?: AuthError;
}

export interface ModelsResponse {
  success: boolean;
  models: Model[];
  error?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}