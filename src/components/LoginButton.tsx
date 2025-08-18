'use client'
import React, {useState, Fragment} from 'react'
import {useRouter} from 'next/navigation'
import {whiteLoadingSvg} from './svg';
import {useCommonContext} from '~/context/common-context';
import {useSession} from "next-auth/react";
import {Menu, Transition} from '@headlessui/react';
import {ChevronDownIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon} from '@heroicons/react/20/solid';
import {getLinkHref} from "~/utils/buildLink";

const LoginButton = ({
                       buttonType = 0,
                       loginText = 'Log in',
                       locale = 'en'
                     }) => {

  const router = useRouter();
  const {data: session, status} = useSession();

  const {
    userData,
    setUserData,
    setShowLoginModal,
    setShowLogoutModal
  } = useCommonContext()
  const [loading, setLoading] = useState(false)

  async function login(event) {
    event.preventDefault();
    setLoading(true)
    let _userData;
    if (userData == null || Object.keys(userData).length == 0) {
      if (status == 'authenticated') {
        setUserData(session?.user)
        _userData = session?.user
      }
    } else {
      _userData = userData
    }

    if (_userData != null && Object.keys(_userData).length != 0) {
      router.refresh();
    } else {
      setShowLoginModal(true)
      setLoading(false)
    }
  }

  async function logout() {
    setShowLogoutModal(true);
  }

  const handleSettingsClick = () => {
    router.push(getLinkHref(locale, 'settings'));
  };

  return (
    <>
      {
        buttonType == 0 && (
          <>
            {
              loading ? (
                  <button
                    className="inline-flex w-full justify-center gap-x-1.5 border border-[rgba(0,0,0,0.5)] rounded-md px-3 py-2 text-sm font-semibold hover:border-[rgba(0,0,0,0.9)]"
                    disabled
                  >
                    <p>Login</p>
                    {whiteLoadingSvg}
                  </button>
                ) :
                (
                  <button
                    className="inline-flex w-full justify-center gap-x-1.5 border border-[rgba(0,0,0,0.5)] rounded-md px-3 py-2 text-sm font-semibold hover:border-[rgba(0,0,0,0.9)]"
                    onClick={login}
                  >
                    {loginText}
                  </button>
                )
            }
          </>
        )
      }
      {
        buttonType == 1 && (
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="my-auto mx-auto ltr:mr-4 rtl:ml-4 mt-1 inline-flex w-full justify-center gap-x-1.5 rounded-md text-sm font-semibold hover:bg-gray-50 p-1">
                <img className="h-8 w-8 rounded-full" src={userData.image} alt="User avatar"/>
                <ChevronDownIcon className="h-3 w-3 mt-2 text-gray-400" aria-hidden="true"/>
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
              <Menu.Items className="absolute right-0 z-30 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSettingsClick}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <Cog6ToothIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                        {locale === 'zh' ? '设置' : 'Settings'}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <ArrowLeftOnRectangleIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                        {locale === 'zh' ? '退出登录' : 'Sign out'}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )
      }
    </>
  )
}

export default LoginButton
