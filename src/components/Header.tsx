'use client'
import {useState} from 'react'
import {Dialog} from '@headlessui/react'
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import {GlobeAltIcon} from '@heroicons/react/24/outline'
import {Fragment} from 'react'
import {Menu, Transition} from '@headlessui/react'
import {ChevronDownIcon} from '@heroicons/react/20/solid'
import Link from "next/link";
import {languages} from "~/config";
import {useCommonContext} from '~/context/common-context'
import LoadingModal from "./LoadingModal";
import LoginButton from './LoginButton';
import LoginModal from './LoginModal';
import LogoutModal from "./LogoutModal";
import {getLinkHref} from "~/utils/buildLink";
import ToastModal from "~/components/ToastModal";
import OneTapComponent from "~/components/OneTapComponent";

export default function Header({
                                 locale,
                                 page,
                                 languageList = languages
                               }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {setShowLoadingModal, userData, commonText, authText, menuText} = useCommonContext();

  const [pageResult] = useState(getLinkHref(locale, page))

  const checkLocalAndLoading = (lang) => {
    setMobileMenuOpen(false);
    if (locale != lang) {
      setShowLoadingModal(true);
    }
  }

  const checkPageAndLoading = (toPage) => {
    setMobileMenuOpen(false);
    if (page.indexOf(toPage) == -1) {
      setShowLoadingModal(true);
    }
  }

  const [languageListResult, setLanguageListResult] = useState(
    process.env.NEXT_PUBLIC_SHOW_LANGUAGE != '0' ? languageList : [{
      code: "en-US",
      lang: "en",
      language: "English",
      languageInChineseSimple: "英语"
    }]
  );

  return (
    <header className="bg-white top-0 z-20 w-full border border-b-gray-100">
      {
        process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' ?
          <OneTapComponent/>
          :
          null
      }
      <LoadingModal loadingText={commonText.loadingText}/>
      <LoginModal
        loadingText={commonText.loadingText}
        redirectPath={pageResult}
        loginModalDesc={authText.loginModalDesc}
        loginModalButtonText={authText.loginModalButtonText}
      />
      <LogoutModal
        logoutModalDesc={authText.logoutModalDesc}
        confirmButtonText={authText.confirmButtonText}
        cancelButtonText={authText.cancelButtonText}
        redirectPath={pageResult}
      />
      <ToastModal
        confirmButtonText={authText.toastConfirmText}
      />
      <nav className="mx-auto max-w-7xl flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex">
          <Link
            href={getLinkHref(locale, '')}
            className="-m-1.5 ltr:ml-0.5 rtl:mr-0.5 p-1.5"
            onClick={() => checkPageAndLoading('')}>
            <img
              className="h-8 w-auto"
              src={`/appicon.svg?v=${process.env.NEXT_PUBLIC_RESOURCE_VERSION}`}
              style={{width: '32px', height: '34px'}}
              alt={process.env.NEXT_PUBLIC_DOMAIN_NAME}
            />
          </Link>
          <Link
            href={getLinkHref(locale, '')}
            className="-m-1.5 ltr:ml-0.5 rtl:mr-0.5 p-1.5"
            onClick={() => checkPageAndLoading('')}>
            <img
              className="h-8 w-auto"
              src={`/website.svg?v=${process.env.NEXT_PUBLIC_RESOURCE_VERSION}`}
              alt={process.env.NEXT_PUBLIC_DOMAIN_NAME}
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-500"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true"/>
          </button>
        </div>
        <div className="hidden ltr:lg:ml-14 rtl:lg:mr-14 lg:flex lg:flex-1 lg:gap-x-6">
          <Link
            href={getLinkHref(locale, 'blog')}
            onClick={() => checkPageAndLoading('blog')}
            className={`text-sm font-semibold leading-6 header-link ${page.indexOf('blog') != -1 ? 'header-choose-color': ''}`}>
            {locale === 'zh' ? '博客' : 'Blog'}
          </Link>
          {
            process.env.NEXT_PUBLIC_DISCOVER_OPEN != '0' ?
              <Link
                href={getLinkHref(locale, process.env.NEXT_PUBLIC_DISCOVER_NAME)}
                onClick={() => checkPageAndLoading(process.env.NEXT_PUBLIC_DISCOVER_NAME)}
                className={`text-sm font-semibold leading-6 header-link ${page.indexOf(process.env.NEXT_PUBLIC_DISCOVER_NAME) != -1 ? 'header-choose-color': ''}`}>
                {menuText.header0}
              </Link>
              :
              null
          }
          {
            userData.email ?
              <Link
                href={getLinkHref(locale, process.env.NEXT_PUBLIC_MY_NAME)}
                onClick={() => checkPageAndLoading(process.env.NEXT_PUBLIC_MY_NAME)}
                className={`text-sm font-semibold leading-6 header-link ${page == process.env.NEXT_PUBLIC_MY_NAME ? 'header-choose-color': ''}`}>
                {menuText.header1}
              </Link>
              :
              null
          }
        </div>
        <Menu as="div" className="hidden lg:relative lg:inline-block lg:text-left z-30">
          <div>
            <Menu.Button
              className="inline-flex w-full justify-center gap-x-1.5 border border-[rgba(255,255,255,0.5)] rounded-md px-3 py-2 text-sm font-semibold hover:border-[rgba(255,255,255,0.9)]">
              <GlobeAltIcon className="w-5 h-5"/>{locale == 'default' ? 'EN' : locale.toUpperCase()}
              <ChevronDownIcon className="ltr:-mr-1 rtl:-ml-1 h-5 w-5" aria-hidden="true"/>
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
            <Menu.Items
              className="absolute right-0 z-30 mt-2 w-26 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1 z-30">
                {
                  languageListResult.map((item) => {
                    let hrefValue = `/${item.lang}`;
                    if (page) {
                      hrefValue = `/${item.lang}/${page}`;
                    }
                    return (
                      <Menu.Item key={item.lang}>
                        <Link href={hrefValue} onClick={() => checkLocalAndLoading(item.lang)} className={"z-30"}>
                              <span
                                className={'text-gray-700 block px-4 py-2 text-sm hover:text-[#2d6ae0] z-30'}
                              >
                                {item.language}
                              </span>
                        </Link>
                      </Menu.Item>
                    )
                  })
                }
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        {
          process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' ?
            <div className="hidden ltr:lg:ml-2 rtl:lg:mr-2 lg:relative lg:inline-block lg:text-left">
              <LoginButton buttonType={userData.email ? 1 : 0} loginText={authText.loginText}/>
            </div>
            :
            null
        }
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-30"/>
        <Dialog.Panel
          className="fixed inset-y-0 right-0 z-30 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <div className="flex">
              <Link href={getLinkHref(locale, '')} className="-m-1.5 ltr:ml-0.5 rtl:mr-0.5 p-1.5"
                    onClick={() => checkPageAndLoading('')}>
                <img
                  className="h-8 w-auto"
                  src={`/appicon.svg?v=${process.env.NEXT_PUBLIC_RESOURCE_VERSION}`}
                  alt={process.env.NEXT_PUBLIC_DOMAIN_NAME}
                />
              </Link>
              <Link href={getLinkHref(locale, '')} className="-m-1.5 ltr:ml-0.5 rtl:mr-0.5 p-1.5"
                    onClick={() => checkPageAndLoading('')}>
                <img
                  className="h-8 w-auto"
                  src={`/website.svg?v=${process.env.NEXT_PUBLIC_RESOURCE_VERSION}`}
                  alt={process.env.NEXT_PUBLIC_DOMAIN_NAME}
                />
              </Link>
            </div>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 z-20"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true"/>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  href={getLinkHref(locale, 'blog')}
                  onClick={() => checkPageAndLoading('blog')}
                  className={`block rounded-lg px-3 py-2 text-base font-semibold leading-7 header-link ${page.indexOf('blog') != -1 ? 'header-choose-color': ''}`}>
                  {locale === 'zh' ? '博客' : 'Blog'}
                </Link>
                {
                  process.env.NEXT_PUBLIC_DISCOVER_OPEN != '0' ?
                    <Link
                      href={getLinkHref(locale, process.env.NEXT_PUBLIC_DISCOVER_NAME)}
                      onClick={() => checkPageAndLoading(process.env.NEXT_PUBLIC_DISCOVER_NAME)}
                      className={`block rounded-lg px-3 py-2 text-base font-semibold leading-7 header-link ${page.indexOf(process.env.NEXT_PUBLIC_DISCOVER_NAME) != -1 ? 'header-choose-color': ''}`}>
                      {menuText.header0}
                    </Link>
                    :
                    null
                }
                {
                  userData.email ?
                    <Link
                      href={getLinkHref(locale, process.env.NEXT_PUBLIC_MY_NAME)}
                      onClick={() => checkPageAndLoading(process.env.NEXT_PUBLIC_MY_NAME)}
                      className={`block rounded-lg px-3 py-2 text-base font-semibold leading-7 header-link ${page == process.env.NEXT_PUBLIC_MY_NAME ? 'header-choose-color': ''}`}>
                      {menuText.header1}
                    </Link>
                    :
                    null
                }

              </div>
              <div className="ltr:ml-2 rtl:mr-2 py-4">
                <Menu as="div" className="relative inline-block text-left z-20">
                  <div>
                    <Menu.Button
                      className="inline-flex w-full justify-center gap-x-1.5 border border-[rgba(255,255,255,0.5)] rounded-md px-3 py-2 text-sm font-semibold hover:border-[rgba(255,255,255,0.9)]">
                      <GlobeAltIcon
                        className="w-5 h-5"/>{locale == 'default' ? 'EN' : locale.toUpperCase()}
                      <ChevronDownIcon className="ltr:-mr-1 rtl:-mr-1 h-5 w-5" aria-hidden="true"/>
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
                    <Menu.Items
                      className="absolute right-0 z-10 mt-2 w-26 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {
                          languageListResult.map((item) => {
                            let hrefValue = `/${item.lang}`;
                            if (page) {
                              hrefValue = `/${item.lang}/${page}`;
                            }
                            return (
                              <Menu.Item key={item.lang}>
                                <Link href={hrefValue} onClick={() => checkLocalAndLoading(item.lang)}>
                              <span
                                className={'text-gray-700 block px-4 py-2 text-sm hover:text-[#2d6ae0]'}
                              >
                                {item.language}
                              </span>
                                </Link>
                              </Menu.Item>
                            )
                          })
                        }
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              {
                process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' ?
                  <div
                    className="relative inline-block text-left text-base font-semibold ltr:ml-2 rtl:mr-2">
                    <LoginButton buttonType={userData.email ? 1 : 0} loginText={authText.loginText}/>
                  </div>
                  :
                  null
              }
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
