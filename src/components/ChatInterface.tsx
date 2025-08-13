'use client'
import { useEffect, useRef, useState } from "react";
import { useCommonContext } from "~/context/common-context";
import TurnstileWidget, { TurnstileRef } from "~/components/TurnstileWidget";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  commonText: any;
}

const ChatInterface = ({ commonText }: ChatInterfaceProps) => {
  const [textStr, setTextStr] = useState('');
  const [resStr, setResStr] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const textareaRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(resStr);

  const {
    setShowLoadingModal,
    userData,
    setShowLoginModal,
    setToastText,
    setShowToastModal
  } = useCommonContext();

  useEffect(() => {
    valueRef.current = resStr;
  }, [resStr]);

  useEffect(() => {
    getLocalStorage();
  }, []);

  // Removed client-side verification to avoid token invalidation
  // The server will handle all Turnstile verification

  const handleGetAnswer = async () => {
    console.log(textStr);
    if (!textStr) {
      console.log("empty text");
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

    // Check if Turnstile verification is needed
    if (!turnstileToken) {
      setPendingGeneration(true);
      setShowTurnstile(true);
      setToastText(commonText.securityVerificationRequired);
      setShowToastModal(true);
      return;
    }

    // Execute generation directly if token is available
    await executeGeneration(turnstileToken);
  };

  const executeGeneration = async (token: string) => {
    // Skip client-side verification to avoid token invalidation
    // The server will handle the verification
    await generateTextStream(token);

    // Reset Turnstile after successful generation
    turnstileRef.current?.reset();
    setTurnstileToken(null);
    setShowTurnstile(false);
    setPendingGeneration(false);
  };

  const generateTextStream = async (token: string) => {
    const requestData = {
      textStr: textStr,
      user_id: userData?.user_id,
      turnstileToken: token
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
    if (response.status === 403) {
      setToastText(commonText.securityVerificationFailed);
      setShowToastModal(true);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setShowTurnstile(true);
      setPendingGeneration(false);
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

  const handleTurnstileVerify = (token: string) => {
    console.log('Turnstile verification completed, token received:', token.substring(0, 20) + '...');
    setTurnstileToken(token);
    setShowTurnstile(false);

    // If there's a pending generation request, execute it now
    if (pendingGeneration) {
      setPendingGeneration(false);
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        executeGeneration(token);
      }, 100);
    }
  };

  const handleTurnstileError = () => {
    console.log('Turnstile verification error occurred');
    setToastText(commonText.securityVerificationError);
    setShowToastModal(true);
    setTurnstileToken(null);
    setPendingGeneration(false);
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
    setShowTurnstile(true);
    // Keep pendingGeneration true so user doesn't need to click again
  };

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
    if (data.skipped) {
      console.log('内容未保存:', data.reason);
    } else {
      console.log('内容已保存到数据库');
    }
  }

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
      {/* Input Section */}
      <div className="w-[90%] mx-auto rounded-tl-[30px] rounded-tr-[30px] border-[12px] border-[#c9bfbf1f] object-fill">
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
                  onClick={handleGetAnswer}
                  className="w-full inline-flex justify-center items-center rounded-md button-bg px-3 py-2 text-md font-semibold text-white shadow-sm">
                  {commonText.getAnswerText}
                </button>
              </div>
            </div>
            {showTurnstile && (
              <div className="border-t border-gray-200 px-2 py-4">
                <div className="text-center text-sm text-gray-600 mb-2">
                  {pendingGeneration
                    ? "Please complete security verification to get your answer:"
                    : commonText.securityVerificationText}
                </div>
                <TurnstileWidget
                  ref={turnstileRef}
                  onVerify={handleTurnstileVerify}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileExpire}
                />
                {pendingGeneration && (
                  <div className="text-center text-xs text-gray-500 mt-2">
                    Your request will be processed automatically after verification
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="w-[90%] mx-auto flex justify-start items-center mt-4">
        <div className="text-gray-400 text-xl">{commonText.inputTipText}</div>
      </div>
      <div className="w-[90%] mx-auto flex justify-start items-center mb-4 mt-2">
        <div className="text-gray-400 text-xl">{commonText.inputTipText2}</div>
      </div>

      {/* Answer Section */}
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
    </>
  );
};

export default ChatInterface;