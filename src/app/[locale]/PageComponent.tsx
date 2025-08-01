import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { getLinkHref } from "~/utils/buildLink";
import TextCardItem from "~/components/TextCardItem";
import ChatInterface from "~/components/ChatInterface";
import ClientNavLink from "~/components/ClientNavLink";

interface PageComponentProps {
  locale: string;
  indexText: any;
  resultInfoListInit: any[];
  commonText: any;
}

const PageComponent = ({
  locale,
  indexText,
  resultInfoListInit,
  commonText
}: PageComponentProps) => {
  const pagePath = '';
  const resultInfoList = resultInfoListInit;

  return (
    <>
      <HeadInfo
        locale={locale}
        page={pagePath}
        title={indexText.title}
        description={indexText.description}
      />
      <Header
        locale={locale}
        page={pagePath}
      />
      <div className="mt-10 my-auto min-h-[90vh]">
        <div className="mx-auto w-full max-w-7xl px-5 mb-5">
          <div className="mx-auto w-full px-5">
            <div
              className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <h1 className="mb-4 text-4xl font-bold md:text-6xl">{indexText.h1Text}</h1>
              <div className="mb-4 max-w-[100%]">
                <h2 className="text-[#7c8aaa] text-xl">
                  {indexText.h2TextBegin}
                  {
                    indexText.h2TextOrder == "0" ?
                      <a href={getLinkHref(locale, '')}
                        title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                        className={"cursor-pointer main-color-0 hover:text-blue-600"}>
                        AI
                      </a>
                      :
                      <a href={getLinkHref(locale, '')}
                        title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                        className={"cursor-pointer main-color-1 hover:text-blue-600"}>
                        {process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                      </a>
                  }
                  {indexText.h2TextMiddle}
                  {
                    indexText.h2TextOrder == "1" ?
                      <a href={getLinkHref(locale, '')}
                        title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                        className={"cursor-pointer main-color-0 hover:text-blue-600"}>
                        AI
                      </a>
                      :
                      <a href={getLinkHref(locale, '')}
                        title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                        className={"cursor-pointer main-color-1 hover:text-blue-600"}>
                        {process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                      </a>
                  }
                  {indexText.h2TextEnd}
                </h2>
              </div>
            </div>
          </div>

          <ChatInterface commonText={commonText} />

          {
            resultInfoList?.length > 0 ?
              <div className={"w-[85%] md:w-[90%] mx-auto mb-10 mt-8"}>
                <div className={"flex justify-center items-start mb-8"}>
                  <h2 className="text-white text-3xl">{indexText.latestChatTitleText}</h2>
                </div>
                <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"}>
                  {
                    resultInfoList.map((item, index) => {
                      return (
                        <TextCardItem
                          key={item.input_text + index + item.uid}
                          locale={locale}
                          item={item}
                        />
                      )
                    })
                  }
                </div>
              </div>
              : null
          }

          {
            resultInfoList?.length > 0 ?
              <div className={"px-4 mb-20"}>
                <ClientNavLink
                  href={getLinkHref(locale, process.env.NEXT_PUBLIC_DISCOVER_NAME)}
                  className={"flex justify-center items-center text-xl text-red-400 hover:text-blue-600"}>
                  {commonText.exploreMore} {'>>'}
                </ClientNavLink>
              </div>
              : null
          }

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
