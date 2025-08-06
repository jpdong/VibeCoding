'use client'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Subscription, AuthState } from '~/types/auth'

interface AuthContextType extends AuthState {}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check session on mount and periodically
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          setSubscription(data.subscription)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setSubscription(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setSubscription(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Session check error:', error)
      setUser(null)
      setSubscription(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login function
  const login = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectTo: window.location.pathname,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.url) {
          window.location.href = data.url
        }
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        setUser(null)
        setSubscription(null)
        setIsAuthenticated(false)
        // Redirect to home page
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          setSubscription(data.subscription)
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }, [])

  // Refresh subscription data
  const refreshSubscription = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/subscription/status', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSubscription(data.subscription)
        }
      }
    } catch (error) {
      console.error('Refresh subscription error:', error)
    }
  }, [user])

  // Initialize auth state
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Set up periodic session refresh
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkSession, 5 * 60 * 1000) // Check every 5 minutes
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, checkSession])

  // Listen for storage events (for multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_logout') {
        setUser(null)
        setSubscription(null)
        setIsAuthenticated(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const value: AuthContextType = {
    user,
    subscription,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    refreshSubscription,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for checking if user has premium access
export function usePremiumAccess() {
  const { subscription } = useAuth()
  
  return {
    hasPremium: subscription?.planType === 'premium' && subscription?.status === 'active',
    isExpired: subscription?.status === 'expired',
    subscription,
  }
}

// Hook for checking model access
export function useModelAccess() {
  const { hasPremium } = usePremiumAccess()
  const { isAuthenticated } = useAuth()

  const canAccessModel = useCallback((modelTier: 'free' | 'premium') => {
    if (modelTier === 'free') return true
    return isAuthenticated && hasPremium
  }, [isAuthenticated, hasPremium])

  return {
    canAccessModel,
    hasPremium,
    isAuthenticated,
  }
}