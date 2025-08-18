'use client'
import Link from "next/link";
import {getLinkHref} from "~/utils/buildLink";
import {useCommonContext} from "~/context/common-context";

interface FooterProps {
  locale: string;
  page: string;
}

export default function Footer({
                                 locale,
                                 page
                               }: FooterProps) {
  const {setShowLoadingModal, commonText, menuText} = useCommonContext();

  const checkPageAndLoading = (toPage) => {
    if (page != toPage) {
      setShowLoadingModal(true);
    }
  }

  return (
    <footer aria-labelledby="footer-heading" className={"bg-white border border-t-gray-100"}>
      <div id="footer-heading" className="sr-only">
        Footer
      </div>
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-2">
            <Link
              href={getLinkHref(locale, '')}
            >
              <img
                className="h-10"
                src={`/website.svg?v=${process.env.NEXT_PUBLIC_RESOURCE_VERSION}`}
                alt={process.env.NEXT_PUBLIC_DOMAIN_NAME}
              />
            </Link>
            <p className="text-sm footer-desc-text">
              {commonText.footerDescText}
            </p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="mt-10 md:mt-0">
                <div className="text-sm font-semibold leading-6 footer-leading-text"></div>
                <ul role="list" className="mt-6 space-y-4">
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold leading-6 footer-leading-text">

                </div>
                <ul role="list" className="mt-6 space-y-4">

                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <div className="text-sm font-semibold leading-6 footer-leading-text">
                  Contact
                </div>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <a 
                      href="mailto:jumpdong1025@gmail.com"
                      className="text-sm leading-6 footer-link"
                    >
                      jumpdong1025@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <div className="text-sm font-semibold leading-6 footer-leading-text">
                  {(process.env.NEXT_PUBLIC_PRIVACY_POLICY_OPEN != '0' || process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_OPEN != '0') ? menuText.footerLegal : ''}
                </div>
                <ul role="list" className="mt-6 space-y-4">
                  {
                    process.env.NEXT_PUBLIC_PRIVACY_POLICY_OPEN != '0' ?
                      <li>
                        <Link
                          href={getLinkHref(locale, process.env.NEXT_PUBLIC_PRIVACY_POLICY_NAME)}
                          className="text-sm leading-6 footer-link"
                          onClick={() => checkPageAndLoading(process.env.NEXT_PUBLIC_PRIVACY_POLICY_NAME)}
                        >
                          {menuText.footerLegal0}
                        </Link>
                      </li>
                      :
                      null
                  }
                  {
                    process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_OPEN != '0' ?
                      <li>
                        <Link
                          href={getLinkHref(locale, process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_NAME)}
                          className="text-sm leading-6 footer-link"
                          onClick={() => checkPageAndLoading(process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_NAME)}
                        >
                          {menuText.footerLegal1}
                        </Link>
                      </li>
                      :
                      null
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
