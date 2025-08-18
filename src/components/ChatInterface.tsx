'use client'
import { useEffect, useRef, useState } from "react";
import { useCommonContext } from "~/context/common-context";
import TurnstileWidget, { TurnstileRef } from "~/components/TurnstileWidget";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import UsageIndicator from "~/components/usage/UsageIndicator";
import UsageLimitModal from "~/components/usage/UsageLimitModal";
import ModelSelector from "~/components/ModelSelector";
import { getDefaultModel } from "~/configs/modelConfig";
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
  commonText: any;
}

const ChatInterface = ({ commonText }: ChatInterfaceProps) => {
  const [textStr, setTextStr] = useState('');
  const [resStr, setResStr] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUsage, setCurrentUsage] = useState<any>(null);
  const [usageUpdateKey, setUsageUpdateKey] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(getDefaultModel().id);
  const turnstileRef = useRef<TurnstileRef>(null);
  const textareaRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(resStr);
  const router = useRouter();

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
    getSelectedModel();
  }, []);

  const getSelectedModel = () => {
    const savedModelId = localStorage.getItem('selectedModelId');
    if (savedModelId) {
      setSelectedModelId(savedModelId);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    localStorage.setItem('selectedModelId', modelId);
  };

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

    // Disable button immediately
    setIsButtonDisabled(true);

    // Check if Turnstile verification is needed
    if (!turnstileToken) {
      setPendingGeneration(true);
      setShowTurnstile(true);
      // Don't show toast modal, just show Turnstile
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
    setIsButtonDisabled(false); // Re-enable button after completion
  };

  const generateTextStream = async (token: string) => {
    console.log("generateTextStream:",textStr);
    const requestData = {
      textStr: textStr,
      user_id: userData?.user_id,
      turnstileToken: token,
      modelId: selectedModelId
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
      // Check if this is a usage limit error
      try {
        const errorData = await response.json();
        if (errorData.usageInfo) {
          // This is a usage limit error
          setUsageInfo(errorData.usageInfo);
          setShowUsageLimitModal(true);
          return;
        }
      } catch (e) {
        // Fallback to the original behavior for other 429 errors
      }
      
      setToastText("Requested too frequently!");
      setShowToastModal(true);
      return;
    }
    if (response.status === 403) {
      // Check if this is a premium model access error
      try {
        const errorData = await response.json();
        if (errorData.requiresUpgrade && errorData.modelId) {
          // This is a premium model access error
          setToastText("Premium model access requires subscription upgrade.");
          setShowToastModal(true);
          setIsButtonDisabled(false);
          return;
        }
      } catch (e) {
        // Fallback to security verification error
      }
      
      setToastText(commonText.securityVerificationFailed);
      setShowToastModal(true);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setShowTurnstile(true);
      setPendingGeneration(false);
      setIsButtonDisabled(false); // Re-enable button on verification failure
      return;
    }
    const data = response.body;
    const reader = data.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false
    let fullResponse = '' // 收集完整响应
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        const chunk = decoder.decode(value);
        
        // 检查是否是用量更新事件
        if (chunk.includes('__USAGE_UPDATE__')) {
          try {
            const usageStartIndex = chunk.indexOf('__USAGE_UPDATE__');
            const usageEndIndex = chunk.indexOf('__END_USAGE__');
            
            if (usageStartIndex !== -1 && usageEndIndex !== -1) {
              const usageDataStr = chunk.substring(
                usageStartIndex + '__USAGE_UPDATE__'.length,
                usageEndIndex
              );
              const usageData = JSON.parse(usageDataStr);
              
              if (usageData.type === 'usage_update') {
                console.log('Received usage update:', usageData.usage);
                setCurrentUsage(usageData.usage);
                setUsageUpdateKey(prev => prev + 1); // 触发 UsageIndicator 更新
              }
              continue; // 跳过包含用量更新的数据块
            }
          } catch (e) {
            console.log('Error parsing usage update:', e);
          }
        }
        
        // 处理正常的流内容（排除用量更新数据）
        if (chunk === '\n' && fullResponse.endsWith('\n')) {
          continue
        }
        if (chunk && !chunk.includes('__USAGE_UPDATE__')) {
          fullResponse += chunk
          setResStr(prevState => {
            const newState = prevState + chunk;
            return newState;
          });
          scrollToBottom();
        }
      }
      done = readerDone;
    }
    
    // 流式响应完成，保存聊天记录
    console.log('Stream completed, saving chat with response length:', fullResponse.length);
    await saveChatTextWithContent(textStr, fullResponse);
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
    } else {
      // Re-enable button if no pending generation
      setIsButtonDisabled(false);
    }
  };

  const handleTurnstileError = () => {
    console.log('Turnstile verification error occurred');
    setToastText(commonText.securityVerificationError);
    setShowToastModal(true);
    setTurnstileToken(null);
    setPendingGeneration(false);
    setIsButtonDisabled(false); // Re-enable button on error
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
    setShowTurnstile(true);
    // Keep pendingGeneration true so user doesn't need to click again
  };

  const saveChatText = async () => {
    // 防止重复保存
    if (isSaving || !textStr || !resStr) {
      return;
    }
    
    setIsSaving(true);
    try {
      const requestData = {
        input_text: textStr,
        output_text: resStr, // 使用当前的resStr而不是valueRef
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
    } catch (error) {
      console.error('保存聊天记录时出错:', error);
    } finally {
      setIsSaving(false);
    }
  }

  const saveChatTextWithContent = async (inputText: string, outputText: string) => {
    // 防止重复保存
    if (isSaving || !inputText || !outputText) {
      console.log('Skip saving:', { isSaving, hasInput: !!inputText, hasOutput: !!outputText });
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Saving chat text:', { inputLength: inputText.length, outputLength: outputText.length });
      const requestData = {
        input_text: inputText,
        output_text: outputText,
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
    } catch (error) {
      console.error('保存聊天记录时出错:', error);
    } finally {
      setIsSaving(false);
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
            {/* Model Selector */}
            <div className="border-t border-gray-200 px-4 py-3">
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelChange={handleModelChange}
                userType={currentUsage?.userType || (userData?.current_plan === 'premium' && userData?.subscription_status === 'active') ? 'premium' : userData ? 'free' : 'guest'}
                className="w-full"
              />
            </div>
            <div className="flex justify-center items-center space-x-3 border-t border-gray-200 px-2 py-2">
              <div className="pt-2">
                <button
                  onClick={handleGetAnswer}
                  disabled={isButtonDisabled}
                  className={`w-full inline-flex justify-center items-center rounded-md px-3 py-2 text-md font-semibold shadow-sm transition-all duration-200 ${
                    isButtonDisabled 
                      ? 'bg-gray-400 text-gray-300 cursor-not-allowed' 
                      : 'button-bg text-white hover:opacity-90'
                  }`}>
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

      {/* Usage Indicator */}
      <div className="w-[90%] mx-auto mt-4">
        <UsageIndicator
            key={usageUpdateKey} // 使用专门的更新键，而不是resStr长度
            externalUsage={currentUsage} // 传入当前用量数据
            onUpgradeClick={() => {
              if (!userData) {
                setShowLoginModal(true);
              } else {
                window.dispatchEvent(new CustomEvent('openPricingModal'));
              }
            }}
        />
      </div>

      {/* Usage Limit Modal */}
      <UsageLimitModal
        isOpen={showUsageLimitModal}
        onClose={() => setShowUsageLimitModal(false)}
        userType={usageInfo?.userType || 'guest'}
        onSignIn={() => {
          setShowUsageLimitModal(false);
          setShowLoginModal(true);
        }}
        onUpgrade={() => {
          setShowUsageLimitModal(false);
          router.push('/#pricing');
        }}
      />
    </>
  );
};

export default ChatInterface;