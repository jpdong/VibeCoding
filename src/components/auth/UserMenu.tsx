'use client'
import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, UserCircleIcon, CreditCardIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth, usePremiumAccess } from '~/context/auth-context'
import { User } from '~/types/auth'

interface UserMenuProps {
  user: User
  commonText: any
  authText: any
}

const UserMenu: React.FC<UserMenuProps> = ({ user, commonText, authText }) => {
  const { logout } = useAuth()
  const { hasPremium, subscription } = usePremiumAccess()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffa11b] transition-colors">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || user.email}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <UserCircleIcon className="w-6 h-6 text-gray-400" />
          )}
          <span className="hidden sm:block max-w-32 truncate">
            {user.name || user.email}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* User Info Section */}
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.email}
            </p>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                hasPremium 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {hasPremium ? '✨ Premium' : '🆓 Free'}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/profile"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Profile Settings
                </a>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <a
                  href="/pricing"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <CreditCardIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  {hasPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                </a>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <a
                  href="/settings"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex items-center px-4 py-2 text-sm`}
                >
                  <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  Settings
                </a>
              )}
            </Menu.Item>
          </div>

          {/* Logout Section */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  {authText?.logoutText || 'Logout'}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default UserMenu