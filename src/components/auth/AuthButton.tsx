'use client'
import React from 'react'
import { useAuth } from '~/context/auth-context'
import UserMenu from './UserMenu'

interface AuthButtonProps {
  commonText: any
  authText: any
}

const AuthButton: React.FC<AuthButtonProps> = ({ commonText, authText }) => {
  const { user, isAuthenticated, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return <UserMenu user={user} commonText={commonText} authText={authText} />
  }

  return (
    <button
      onClick={login}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#ffa11b] hover:bg-[#f79100] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffa11b] transition-colors"
    >
      {authText?.loginText || 'Login'}
    </button>
  )
}

export default AuthButton