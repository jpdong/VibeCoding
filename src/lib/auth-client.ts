'use client'

// Client-side authentication utilities
export class AuthClient {
  private static instance: AuthClient
  private baseUrl: string

  private constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  }

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient()
    }
    return AuthClient.instance
  }

  // Google One-Tap login
  async initializeOneTap() {
    if (typeof window === 'undefined') return

    try {
      // Load Google One-Tap script
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: this.handleOneTapResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          // Show One-Tap prompt
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('One-Tap not displayed:', notification.getNotDisplayedReason())
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to initialize Google One-Tap:', error)
    }
  }

  private async handleOneTapResponse(response: any) {
    try {
      const { credential } = response

      // Send credential to our backend
      const result = await fetch('/api/auth/google/one-tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      })

      if (result.ok) {
        // Reload page to update auth state
        window.location.reload()
      }
    } catch (error) {
      console.error('One-Tap login error:', error)
    }
  }

  // Regular Google OAuth login
  async loginWithGoogle(redirectTo?: string) {
    try {
      const response = await fetch('/api/auth/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectTo: redirectTo || window.location.pathname,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.url) {
          window.location.href = data.url
        }
      }
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  // Logout
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Notify other tabs
        localStorage.setItem('auth_logout', Date.now().toString())
        localStorage.removeItem('auth_logout')
        
        // Redirect to home
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get current session
  async getSession() {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Get session error:', error)
    }
    return null
  }

  // Update user profile
  async updateProfile(data: { name?: string; avatarUrl?: string }) {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Update profile error:', error)
    }
    return null
  }
}

// Global auth client instance
export const authClient = AuthClient.getInstance()

// Google One-Tap types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}