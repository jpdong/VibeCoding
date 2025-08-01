import {getLinkHref} from "~/utils/buildLink";
import Link from "next/link";
import {useCommonContext} from "~/context/common-context";
import Markdown from "react-markdown";

const TextCardItem = ({
                      locale,
                      item,
                      }) => {

  const {commonText, setShowLoadingModal} = useCommonContext();

  return (
    <>
      <div className="relative">
        <span
          className="absolute top-0 left-0 px-2 py-1 text-s font-bold text-white bg-[#ffa11b] rounded-tl rounded-br">
          GPT-4o
        </span>
        <div className={"bg-white rounded-xl p-4 shadow-lg w-full md:w-70 h-70"}>
          <Link
            href={getLinkHref(locale, `${process.env.NEXT_PUBLIC_CHAT_NAME}/${item.uid}`)}
            onClick={() => setShowLoadingModal(true)}
          >
            <div>
              <div className="text-gray-600 font-bold text-xl line-clamp-2 mb-2 mt-5 h-14">
                {item.title}
              </div>
              <div className="text-gray-400 text-lg line-clamp-5">
                <Markdown>
                  {item.output_text}
                </Markdown>
              </div>
            </div>
          </Link>
        </div>
        {
          item.user_name ?
            <div className="text-xs mt-2 p-1">
              {commonText.createTextBegin.replace(/%username%/g, item.user_name)}
              <Link
                href={getLinkHref(locale, '')}
                className="cursor-pointer hover:text-blue-600"
              >
                <span className="text-[#f05011] ml-[2px]">ChatLLM</span>
              </Link>
              {commonText.createTextEnd.replace(/%username%/g, item.user_name)}
            </div>
            :
            null
        }

      </div>
    </>
  )
}

export default TextCardItem
