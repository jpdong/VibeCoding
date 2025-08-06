'use client'
import React, { useEffect } from 'react'
import { useAuth } from '~/context/auth-context'

const OneTapLogin: React.FC = () => {
  const { isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    // Don't show One-Tap if user is already authenticated
    if (isAuthenticated) return

    // Don't show One-Tap if Google Client ID is not configured
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return

    const initializeOneTap = () => {
      if (typeof window === 'undefined' || !window.google) return

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleOneTapResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
        })

        // Show One-Tap prompt
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('One-Tap not displayed:', notification.getNotDisplayedReason())
          } else if (notification.isSkippedMoment()) {
            console.log('One-Tap skipped:', notification.getSkippedReason())
          }
        })
      } catch (error) {
        console.error('Failed to initialize Google One-Tap:', error)
      }
    }

    const handleOneTapResponse = async (response: any) => {
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
          const data = await result.json()
          if (data.success) {
            // Refresh user data in context
            await refreshUser()
            
            // Optionally show success message
            console.log('One-Tap login successful')
          }
        } else {
          console.error('One-Tap login failed:', await result.text())
        }
      } catch (error) {
        console.error('One-Tap login error:', error)
      }
    }

    // Load Google One-Tap script if not already loaded
    if (!window.google) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeOneTap
      document.head.appendChild(script)

      return () => {
        // Cleanup script on unmount
        document.head.removeChild(script)
      }
    } else {
      // Google script already loaded, initialize immediately
      initializeOneTap()
    }
  }, [isAuthenticated, refreshUser])

  // This component doesn't render anything visible
  return null
}

export default OneTapLogin