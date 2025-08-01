'use client'
import {useEffect, useRef, useState} from "react";
import {useCommonContext} from "~/context/common-context";
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Link from "next/link";
import {getLinkHref} from "~/utils/buildLink";
import TextCardItem from "~/components/TextCardItem";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';

const PageComponent = ({
                         locale,
                         indexText,
                         resultInfoListInit
                        }) => {
  const [pagePath] = useState('');

  const [resultInfoList] = useState(resultInfoListInit);

  const {
    setShowLoadingModal,
    commonText,
    userData,
    setShowLoginModal,
    setToastText,
    setShowToastModal
  } = useCommonContext();

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
    getLocalStorage();
    return () => {
    }
  }, []);

  const hasAnyKey = (obj) => {
    return Object.keys(obj).length > 0;
  }

  const [textStr, setTextStr] = useState('');
  const [resStr, setResStr] = useState('');

  const generateTextStream = async () => {
    console.log(textStr);
    if (!textStr) {
      return;
    }
    if (textStr.length < 10) {
      return;
    }
    if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' && !userData) {
      setShowLoginModal(true);
      setLocalStorage();
      return;
    }
    const requestData = {
      textStr: textStr,
      user_id: userData?.user_id
    }
    setShowLoadingModal(true);
    const response = await fetch(`/api/chat/generateTextStream`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    setShowLoadingModal(false);
    setResStr("");
    if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN != '0' && response.status === 401) {
      setShowLoginModal(true);
      setLocalStorage();
      return;
    }
    if (response.status === 429) {
      setToastText("Requested too frequently!");
      setShowToastModal(true);
      return;
    }
    const data = response.body;
    const reader = data.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        const char = decoder.decode(value);
        if (char === '\n' && resStr.endsWith('\n')) {
          continue
        }
        if (char) {
          setResStr(prevState => prevState + char);
          scrollToBottom();
        }
      }
      done = readerDone;
    }
    // 确保在所有字符都被添加到 resStr 后再调用 saveChatText
    setResStr(prevState => {
      // 更新 valueRef.current
      valueRef.current = prevState;
      // 保存本次数据
      saveChatText();
      return prevState; // 保持 resStr 不变
    });
  }
  const valueRef = useRef(resStr);
  useEffect(() => {
    valueRef.current = resStr;
  }, [resStr]);

  const saveChatText = async () => {
    const requestData = {
      input_text: textStr,
      output_text: valueRef.current,
      user_id: userData?.user_id
    }
    const response = await fetch(`/api/chat/saveText`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    const data = await response.json();
    console.log(data);
  }


  const textareaRef = useRef(null);
  const scrollToBottom = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  const setLocalStorage = () => {
    localStorage.setItem('textStr', textStr);
  }

  const getLocalStorage = () => {
    const textStr = localStorage.getItem('textStr');
    if (textStr) {
      setTextStr(textStr);
      localStorage.removeItem('textStr');
    }
  }

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
                        GPT
                      </a>
                      :
                      <a href={getLinkHref(locale, '')}
                         title={process.env.NEXT_PUBLIC_A_TITLE_TEXT}
                         className={"cursor-pointer main-color-1 hover:text-blue-600"}>
                        ChatLLM
                      </a>
                  }
                  {indexText.h2TextMiddle}
                  {
                    indexText.h2TextOrder == "1" ?
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
                  {indexText.h2TextEnd}
                </h2>
              </div>
            </div>
          </div>

          <div
            className="w-[90%] mx-auto rounded-tl-[30px] rounded-tr-[30px] border-[12px] border-[#c9bfbf1f] object-fill">
            <div className="relative shadow-lg">
              <div className="overflow-hidden focus-within:ring-1 rounded-tl-[20px] rounded-tr-[20px]">
                <textarea
                  rows={6}
                  className="custom-textarea block w-full focus:outline-none focus:border-transparent resize-none border-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-lg p-4"
                  placeholder={commonText.placeholderText}
                  maxLength={1000}
                  minLength={10}
                  value={textStr}
                  onChange={(e) => {
                    setTextStr(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="inset-x-px bottom-1 bg-white">
                <div className="flex justify-center items-center space-x-3 border-t border-gray-200 px-2 py-2">
                  <div className="pt-2">
                    <button
                      onClick={() => generateTextStream()}
                      className="w-full inline-flex justify-center items-center rounded-md button-bg px-3 py-2 text-md font-semibold text-white shadow-sm">
                      {commonText.getAnswerText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[90%] mx-auto flex justify-start items-center mt-4">
            <div className="text-gray-400 text-xl">{commonText.inputTipText}</div>
          </div>
          <div className="w-[90%] mx-auto flex justify-start items-center mb-4 mt-2">
            <div className="text-gray-400 text-xl">{commonText.inputTipText2}</div>
          </div>

          <div>
            <div className="flex justify-center items-start mt-4">
              <div className="text-[#7c8aaa] text-3xl ">{commonText.answerText}</div>
            </div>
            <div className="w-[90%] mx-auto mt-2 border-[12px] border-[#c9bfbf1f] object-fill">
              <div className="relative shadow-lg">
                <div className="overflow-hidden focus-within:ring-1 p-2">
                  <div className="prose w-full max-w-5xl mx-auto text-gray-300 div-markdown-color h-96 overflow-y-auto"
                       ref={textareaRef}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {resStr}
                    </Markdown>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                <Link
                  href={getLinkHref(locale, process.env.NEXT_PUBLIC_DISCOVER_NAME)}
                  onClick={() => setShowLoadingModal(true)}
                  className={"flex justify-center items-center text-xl text-red-400 hover:text-blue-600"}>
                  {commonText.exploreMore} {'>>'}
                </Link>
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
