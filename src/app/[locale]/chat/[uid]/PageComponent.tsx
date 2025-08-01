'use client'
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import {useEffect, useRef, useState} from "react";
import HeadInfo from "~/components/HeadInfo";
import {useCommonContext} from "~/context/common-context";
import Markdown from "react-markdown";
import {getLinkHref} from "~/utils/buildLink";
import remarkGfm from "remark-gfm";

const PageComponent = ({
                         locale = '',
                         uid,
                         detail,
                         chatText
                       }) => {
  const [pagePath] = useState(`${process.env.NEXT_PUBLIC_CHAT_NAME}/${uid}`);

  const { setShowLoadingModal, commonText} = useCommonContext();

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
        title={detail.title + ' | ' + process.env.NEXT_PUBLIC_DOMAIN_NAME}
        description={chatText.description}
        locale={locale}
        page={pagePath}
        isChatDetail={true}
        chatDetail={detail}
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
              <h1 className="mb-4 text-2xl font-bold md:text-4xl">{detail.title}</h1>
              <h2 className="text-xl text-gray-500">
                {chatText.chatWithBegin}
                {
                  chatText.chatWithOrder == "0" ?
                    <a href={getLinkHref(locale, '')}
                       title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                       className={"cursor-pointer main-color-0 hover:text-blue-600"}>
                      GPT
                    </a>
                    :
                    <a href={getLinkHref(locale, '')}
                       title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                       className={"cursor-pointer main-color-1 hover:text-blue-600"}>
                      ChatLLM
                    </a>
                }
                {chatText.chatWithMiddle}
                {
                  chatText.chatWithOrder == "1" ?
                    <a href={getLinkHref(locale, '')}
                       title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                       className={"cursor-pointer main-color-0 hover:text-blue-600"}>
                      GPT
                    </a>
                    :
                    <a href={getLinkHref(locale, '')}
                       title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                       className={"cursor-pointer main-color-1 hover:text-blue-600"}>
                      ChatLLM
                    </a>
                }
                {chatText.chatWithEnd}
              </h2>
            </div>
            <div className="w-[95%] mx-auto h-full my-8">
              <div className="prose w-full max-w-5xl mx-auto mt-8 text-gray-300 div-markdown-color">
                <div className={"text-2xl font-bold text-amber-400"}>{commonText.chatQuestionText}</div>
                <Markdown remarkPlugins={[remarkGfm]}>
                  {detail.input_text}
                </Markdown>
              </div>
            </div>
            <div className="w-[95%] mx-auto h-full my-8">
              <div className="prose w-full max-w-5xl mx-auto mt-8 text-gray-300 div-markdown-color">
                <div className={"text-2xl font-bold text-amber-400"}>{commonText.chatAnswerText}</div>
                <Markdown remarkPlugins={[remarkGfm]}>
                  {detail.output_text}
                </Markdown>
              </div>
            </div>
          </div>
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
