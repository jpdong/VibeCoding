'use client'
import HeadInfo from "~/components/HeadInfo";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import {useEffect, useRef, useState} from "react";
import {useCommonContext} from "~/context/common-context";
import {useInterval} from "ahooks";
import Link from "next/link";
import TextCardItem from "~/components/TextCardItem";
import {getLinkHref} from "~/utils/buildLink";

const PageComponent = ({
                         locale,
                         myText
                       }) => {
  const [pagePath] = useState(process.env.NEXT_PUBLIC_MY_NAME);

  const [resultInfoList, setResultInfoList] = useState([]);
  const {setShowLoadingModal, userData} = useCommonContext();
  const [intervalWorkList, setIntervalWorkList] = useState(1000);

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

  const [currentPage, setCurrentPage] = useState(1);
  const [alreadyLoadAll, setAlreadyLoadAll] = useState(false);

  const myRef = useRef(null);
  const handleScroll = async () => {
    const {scrollHeight, clientHeight, scrollTop} = myRef.current;
    if (scrollHeight - clientHeight <= scrollTop + 1) {
      console.log('Reached bottom');
      if (!alreadyLoadAll) {
        await getCurrentWorkList(currentPage + 1);
      }
    }
  };

  const getCurrentWorkList = async (newPage) => {
    if (!userData.email) {

    } else {
      setCurrentPage(newPage);
      setIntervalWorkList(undefined);
      const requestData = {
        user_id: userData.user_id,
        current_page: newPage
      }
      setShowLoadingModal(true);
      const response = await fetch(`/api/chat/getChatList`, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      const result = await response.json();
      setShowLoadingModal(false);
      if (result.length == 0) {
        setAlreadyLoadAll(true);
      } else {
        setResultInfoList([...resultInfoList, ...result]);
      }
    }
  }
  useInterval(() => {
    getCurrentWorkList(currentPage)
  }, intervalWorkList);


  return (
    <>
      <HeadInfo
        locale={locale}
        page={pagePath}
        title={''}
        description={''}
      />
      <Header
        locale={locale}
        page={pagePath}
      />
      <div className={"my-auto h-screen overflow-y-auto"} ref={myRef} onScroll={handleScroll}>
        <div className="block overflow-hidden">
          <div className="w-[95%] md:w-[65%] max-w-7xl mx-auto px-5 mb-5">
            <div
              className="mx-auto flex max-w-4xl flex-col items-center text-center py-6">
              <h1 className="text-3xl font-bold md:text-4xl">{myText.h1Text}</h1>
            </div>
            <div className={"px-6 mb-8"}>
              <Link
                href={getLinkHref(locale, '')}
                onClick={() => setShowLoadingModal(true)}
                className={"flex justify-center items-center text-xl link-text"}>
                {myText.askNew} {'>>'}
              </Link>
            </div>
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
      <Footer
        locale={locale}
        page={pagePath}
      />
    </>
  )
}

export default PageComponent;
