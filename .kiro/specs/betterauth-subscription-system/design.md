# Design Document

## Overview

This design document outlines the implementation of a comprehensive authentication and subscription system using BetterAuth with Google OAuth, dynamic model management, and subscription-based access control. The system integrates with the existing chat interface while adding premium features and user management.

## Architecture

### System Components

```
Authentication Layer (BetterAuth)
├── Google OAuth Provider
├── One-Tap Integration
├── Session Management
└── User Profile Management

Database Layer (PostgreSQL)
├── Users Table
├── Subscriptions Table
├── Models Table
└── User Sessions Table

API Layer
├── Auth Endpoints (/api/auth/*)
├── Models Endpoint (/api/models)
├── Subscription Endpoints (/api/subscription/*)
└── User Profile Endpoints (/api/user/*)

Frontend Components
├── AuthProvider (Context)
├── LoginButton
├── UserMenu
├── PricingPage
├── ModelSelector (Enhanced)
└── SubscriptionModal
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'free' or 'premium'
  status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Models table
CREATE TABLE models (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(100),
  tier VARCHAR(50) NOT NULL, -- 'free' or 'premium'
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User sessions (managed by BetterAuth)
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Components and Interfaces

### 1. BetterAuth Configuration

**Purpose:** Configure authentication with Google OAuth and One-Tap
**Location:** `src/lib/auth.ts`

**Configuration:**
```typescript
import { betterAuth } from "better-auth"
import { googleOAuth } from "better-auth/plugins/google-oauth"

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
  plugins: [
    googleOAuth({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
})
```

### 2. AuthProvider Context

**Purpose:** Provide authentication state throughout the application
**Features:**
- User session management
- Subscription status tracking
- Login/logout functions
- Auto-refresh of user data

### 3. Enhanced Navigation

**Purpose:** Add login and pricing links to navigation
**Features:**
- Login button for unauthenticated users
- User menu with avatar for authenticated users
- Pricing link always visible
- Responsive mobile design

### 4. PricingPage Component

**Purpose:** Display subscription plans and pricing
**Features:**
- Free tier: Limited models, basic features
- Premium tier: $9.9/month, all models, priority support
- Coming soon modal for subscription buttons
- Clear feature comparison

### 5. Enhanced ModelSelector

**Purpose:** Dynamic model loading with subscription-based access
**Features:**
- Fetch models from API endpoint
- Display free/premium badges
- Restrict premium models for free users
- Subscription prompts for premium features

### 6. SubscriptionModal

**Purpose:** Handle subscription-related interactions
**Features:**
- Coming soon message
- Subscription status display
- Upgrade prompts
- Professional styling

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscription Model
```typescript
interface Subscription {
  id: string;
  userId: string;
  planType: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  startedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Model Model
```typescript
interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  tier: 'free' | 'premium';
  available: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### AuthState Model
```typescript
interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/user` - Get user profile

### Models Endpoint
- `GET /api/models` - Get available models with tier information

### Subscription Endpoints
- `GET /api/subscription/status` - Get user subscription status
- `POST /api/subscription/create` - Create subscription (coming soon)
- `POST /api/subscription/cancel` - Cancel subscription (coming soon)

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Error Handling

### Authentication Errors
- Invalid credentials: Clear error message with retry option
- Session expired: Automatic redirect to login
- OAuth errors: Fallback to manual login
- Network errors: Retry mechanism with exponential backoff

### Subscription Errors
- Invalid subscription: Graceful degradation to free tier
- Expired subscription: Clear notification with upgrade option
- Payment errors: Clear messaging (when implemented)
- API errors: Fallback to cached subscription status

### Model Access Errors
- Premium model access denied: Clear upgrade prompt
- Model unavailable: Fallback to default model
- API errors: Use cached model list
- Network errors: Retry with user feedback

## Security Considerations

### Authentication Security
- Secure session management with BetterAuth
- CSRF protection enabled
- Secure cookie settings (httpOnly, secure, sameSite)
- Session timeout and refresh

### Data Protection
- User data encryption at rest
- Secure API endpoints with authentication
- Input validation and sanitization
- Rate limiting on sensitive endpoints

### Subscription Security
- Server-side subscription validation
- Secure payment processing (when implemented)
- Audit logging for subscription changes
- Protection against subscription manipulation

## Integration Points

### Chat Interface Integration
- Model selection respects subscription status
- Authentication state updates chat interface
- Premium features gated behind subscription
- Seamless user experience

### Existing Components
- Header component updated with auth navigation
- Footer component updated with pricing link
- Common context extended with auth state
- Internationalization support maintained

## Performance Considerations

### Caching Strategy
- User session caching
- Model list caching (5 minutes)
- Subscription status caching (1 minute)
- Static asset caching

### Database Optimization
- Indexed queries on user_id and email
- Connection pooling
- Query optimization
- Regular maintenance tasks

### Frontend Optimization
- Lazy loading of auth components
- Memoized authentication checks
- Efficient state updates
- Minimal re-renders

## Testing Strategy

### Unit Testing
- Authentication flow testing
- Subscription logic testing
- Model access control testing
- Component rendering tests

### Integration Testing
- End-to-end authentication flow
- Subscription upgrade/downgrade flow
- Model selection with different user types
- API endpoint testing

### Security Testing
- Authentication bypass attempts
- Session manipulation testing
- Subscription privilege escalation
- Input validation testing

This design provides a comprehensive foundation for implementing the authentication and subscription system while maintaining the existing functionality and user experience.