'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import {useEffect, useRef, useState} from "react";
import HeadInfo from "~/components/HeadInfo";
import {useCommonContext} from "~/context/common-context";
import {getLinkHref} from "~/utils/buildLink";
import TextCardItem from "~/components/TextCardItem";
import Link from "next/link";
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/20/solid'

const PageComponent = ({
                         locale = '',
                         discoverPageText,
                         resultInfoData,
                         page,
                         pageData
                       }) => {
  const [pagePath] = useState(`${process.env.NEXT_PUBLIC_DISCOVER_NAME}/${page}`);

  const {setShowLoadingModal} = useCommonContext();

  const [resultInfoList] = useState(resultInfoData);

  const checkShowLoading = (toPage) => {
    if (page != toPage) {
      setShowLoadingModal(true);
    }
  }

  const useCustomEffect = (effect, deps) => {
    const isInitialMount = useRef(true);

    useEffect(() => {
      if (process.env.NODE_ENV === 'production' || isInitialMount.current) {
        isInitialMount.current = false;
        return effect();
      }
    }, deps);
  };

  useCustomEffect(() => {
    setShowLoadingModal(false);
    return () => {
    }
  }, []);

  return (
    <>
      <HeadInfo
        title={discoverPageText.title + ' | ' + process.env.NEXT_PUBLIC_DOMAIN_NAME}
        description={discoverPageText.description}
        locale={locale}
        page={pagePath}
      />
      <Header
        locale={locale}
        page={pagePath}
      />
      <div className={"mt-10 my-auto min-h-[90vh]"}>
        <div className="block overflow-hidden bg-cover bg-center">
          <div className="mx-auto w-full max-w-7xl px-5 mb-5">
            <div
              className="mx-auto flex max-w-4xl flex-col items-center text-center py-10">
              <h1 className="mb-4 text-3xl font-bold md:text-5xl">{discoverPageText.h1Text}</h1>
              <div className="mb-5 max-w-[528px] lg:mb-8">
                <p className="text-[#7c8aaa] text-xl">{discoverPageText.h2Text}</p>
              </div>
            </div>

            <div className={"w-[85%] md:w-[90%] mx-auto mb-10 mt-8"}>
              <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"}>
                {
                  resultInfoList.map((item, index) => {
                    return (
                      <TextCardItem
                        key={item.input_text + index}
                        locale={locale}
                        item={item}
                      />
                    )
                  })
                }
              </div>
            </div>

          </div>
        </div>
        <div className={"flex justify-center items-center mb-8"}>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {
              pageData?.pagination?.length > 0 ?
                page == 2 ?
                  <Link
                    key={2 + "Left"}
                    href={getLinkHref(locale, process.env.NEXT_PUBLIC_DISCOVER_NAME)}
                    className="no-underline relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 bg-gray-100 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => checkShowLoading(page)}
                  >
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true"/>
                  </Link>
                  :
                  <Link
                    key={24 + "Left"}
                    href={getLinkHref(locale, `${process.env.NEXT_PUBLIC_DISCOVER_NAME}/${Number(page) - 1}`)}
                    className="no-underline relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 bg-gray-100 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => checkShowLoading(Number(page) - 1)}
                  >
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true"/>
                  </Link>
                :
                null
            }
            {
              pageData?.pagination?.map((pa, index) => {
                let href;
                if (pa == 1) {
                  href = getLinkHref(locale, process.env.NEXT_PUBLIC_DISCOVER_NAME);
                } else if (pa == '...') {
                  href = `#`;
                } else {
                  href = getLinkHref(locale, `${process.env.NEXT_PUBLIC_DISCOVER_NAME}/${pa}`);
                }
                if (pa == page) {
                  return (
                    <Link
                      key={pa + "page"}
                      href={href}
                      aria-current="page"
                      className="no-underline relative z-10 inline-flex items-center bg-[#de5c2d] px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={() => checkShowLoading(pa)}
                    >
                      {pa}
                    </Link>
                  )
                } else {
                  return (
                    <Link
                      key={pa + "page"}
                      href={href}
                      className="no-underline relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 bg-gray-100 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      onClick={() => checkShowLoading(pa)}
                    >
                      {pa}
                    </Link>
                  )
                }
              })
            }
            {
              pageData?.pagination?.length > 0 ?
                page == pageData?.totalPage ?
                  <Link
                    key={page + "Right"}
                    href={getLinkHref(locale, `${process.env.NEXT_PUBLIC_DISCOVER_NAME}/${page}`)}
                    className="no-underline relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 bg-gray-100 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => checkShowLoading(page)}
                  >
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true"/>
                  </Link>
                  :
                  <Link
                    key={2 + "Right"}
                    href={getLinkHref(locale, `${process.env.NEXT_PUBLIC_DISCOVER_NAME}/${Number(page) + 1}`)}
                    className="no-underline relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 bg-gray-100 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    onClick={() => checkShowLoading(Number(page) + 1)}
                  >
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true"/>
                  </Link>
                :
                null
            }
          </nav>
        </div>

      </div>
      <Footer
        locale={locale}
        page={pagePath}
      />
    </>
  )
}

export default PageComponent
