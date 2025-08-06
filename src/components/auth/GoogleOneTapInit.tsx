'use client'
import { useEffect } from 'react'
import { useAuth } from '~/context/auth-context'

const GoogleOneTapInit: React.FC = () => {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Only initialize if user is not authenticated and Google Client ID is configured
    if (isAuthenticated || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      return
    }

    const initializeGoogleOneTap = () => {
      if (typeof window === 'undefined' || !window.google) {
        return
      }

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        // Show the One Tap prompt
        window.google.accounts.id.prompt()
      } catch (error) {
        console.error('Failed to initialize Google One Tap:', error)
      }
    }

    const handleCredentialResponse = async (response: any) => {
      try {
        const result = await fetch('/api/auth/google/one-tap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        })

        if (result.ok) {
          // Reload the page to update authentication state
          window.location.reload()
        }
      } catch (error) {
        console.error('One Tap authentication failed:', error)
      }
    }

    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleOneTap
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [isAuthenticated])

  return null
}

export default GoogleOneTapInit