'use client'
import React, { useEffect, useRef, useState } from "react";
import { useCommonContext } from "~/context/common-context";
import TurnstileWidget, { TurnstileRef } from "~/components/TurnstileWidget";
import { Message, ChatState, AVAILABLE_MODELS } from "~/types/chat";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import SecurityVerification from "./SecurityVerification";
import ErrorMessage from "./ErrorMessage";

interface NewChatInterfaceProps {
  commonText: any;
}

const NewChatInterface: React.FC<NewChatInterfaceProps> = ({ commonText }) => {
  // State management
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    currentInput: '',
    selectedModel: 'gpt-4',
    isLoading: false,
    isTyping: false,
    turnstileToken: null,
    showTurnstile: false,
    pendingGeneration: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const valueRef = useRef('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    setShowLoadingModal,
    userData,
    setShowLoginModal,
    setToastText,
    setShowToastModal
  } = useCommonContext();

  // Initialize component
  useEffect(() => {
    // Load saved model selection
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel && AVAILABLE_MODELS.find(m => m.id === savedModel && m.available)) {
      setChatState(prev => ({ ...prev, selectedModel: savedModel }));
    }

    // Load saved input from localStorage
    const savedInput = localStorage.getItem('textStr');
    if (savedInput) {
      setChatState(prev => ({ ...prev, currentInput: savedInput }));
      localStorage.removeItem('textStr');
    }

    // Cleanup function
    return () => {
      // Cancel any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Update valueRef when messages change
  useEffect(() => {
    const lastMessage = chatState.messages[chatState.messages.length - 1];
    if (lastMessage && lastMessage.type === 'assistant') {
      valueRef.current = lastMessage.content;
    }
  }, [chatState.messages]);

  // Handle model selection
  const handleModelChange = (modelId: string) => {
    setChatState(prev => ({ ...prev, selectedModel: modelId }));
    localStorage.setItem('selectedModel', modelId);
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setChatState(prev => ({ ...prev, currentInput: value }));
  };

  // Handle message send
  const handleSendMessage = async () => {
    const { currentInput, turnstileToken } = chatState;
    
    // Clear previous errors
    setError(null);
    setNetworkError(false);
    
    // Validate input
    if (!currentInput.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (currentInput.length < 10) {
      setError(`Message must be at least 10 characters long (${10 - currentInput.length} more needed)`);
      return;
    }

    if (currentInput.length > 1000) {
      setError('Message is too long (maximum 1000 characters)');
      return;
    }

    // Check authentication
    if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0' && !userData) {
      setShowLoginModal(true);
      localStorage.setItem('textStr', currentInput);
      return;
    }

    // Check Turnstile verification
    if (!turnstileToken) {
      setChatState(prev => ({
        ...prev,
        pendingGeneration: true,
        showTurnstile: true
      }));
      setToastText(commonText.securityVerificationRequired);
      setShowToastModal(true);
      return;
    }

    // Execute generation
    await executeGeneration(turnstileToken);
  };

  // Execute message generation
  const executeGeneration = async (token: string) => {
    const { currentInput, selectedModel } = chatState;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
      model: selectedModel
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentInput: '',
      isLoading: true,
      isTyping: true
    }));

    try {
      const requestData = {
        textStr: currentInput,
        user_id: userData?.user_id,
        turnstileToken: token
      };

      setShowLoadingModal(true);
      
      // Add timeout for network requests
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`/api/chat/generateTextStream`, {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      setShowLoadingModal(false);

      // Handle response errors
      if (!response.ok) {
        let errorMessage = 'An error occurred while processing your request';
        
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            if (process.env.NEXT_PUBLIC_CHECK_GOOGLE_LOGIN !== '0') {
              setShowLoginModal(true);
              localStorage.setItem('textStr', currentInput);
              return;
            }
            errorMessage = 'Authentication required. Please log in and try again.';
            break;
          case 403:
            errorMessage = commonText.securityVerificationFailed || 'Security verification failed. Please try again.';
            turnstileRef.current?.reset();
            setChatState(prev => ({
              ...prev,
              turnstileToken: null,
              showTurnstile: true,
              pendingGeneration: false,
              isLoading: false,
              isTyping: false
            }));
            return;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment before trying again.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = `Request failed with status ${response.status}`;
        }
        
        setError(errorMessage);
        setChatState(prev => ({ ...prev, isLoading: false, isTyping: false }));
        return;
      }

      // Handle streaming response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        model: selectedModel,
        isStreaming: true
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));

      // Stream response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          if (value) {
            const chunk = decoder.decode(value);
            accumulatedContent += chunk;
            
            setChatState(prev => ({
              ...prev,
              messages: prev.messages.map(msg =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: accumulatedContent }
                  : msg
              )
            }));
          }
          done = readerDone;
        }
      }

      // Finalize message
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, isStreaming: false }
            : msg
        ),
        isTyping: false
      }));

      // Save chat
      valueRef.current = accumulatedContent;
      await saveChatText(currentInput, accumulatedContent);

    } catch (error) {
      console.error('Generation error:', error);
      setShowLoadingModal(false);
      
      let errorMessage = 'An error occurred while generating the response.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
          setNetworkError(true);
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
          setNetworkError(true);
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setChatState(prev => ({ ...prev, isLoading: false, isTyping: false }));
    } finally {
      // Reset Turnstile
      turnstileRef.current?.reset();
      abortControllerRef.current = null;
      setChatState(prev => ({
        ...prev,
        turnstileToken: null,
        showTurnstile: false,
        pendingGeneration: false
      }));
    }
  };

  // Save chat text
  const saveChatText = async (inputText: string, outputText: string) => {
    try {
      const requestData = {
        input_text: inputText,
        output_text: outputText,
        user_id: userData?.user_id
      };
      
      const response = await fetch(`/api/chat/saveText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save chat: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Chat saved successfully:', data);
    } catch (error) {
      console.error('Failed to save chat:', error);
      // Don't show error to user for save failures as it's not critical
      // The conversation still works, just not saved
    }
  };

  // Handle Turnstile verification
  const handleTurnstileVerify = (token: string) => {
    console.log('Turnstile verification completed');
    setChatState(prev => ({
      ...prev,
      turnstileToken: token,
      showTurnstile: false
    }));

    // If there's a pending generation, execute it
    if (chatState.pendingGeneration) {
      setChatState(prev => ({ ...prev, pendingGeneration: false }));
      setTimeout(() => {
        executeGeneration(token);
      }, 100);
    }
  };

  const handleTurnstileError = () => {
    console.log('Turnstile verification error');
    setError(commonText.securityVerificationError || 'Security verification error. Please refresh and try again.');
    setToastText(commonText.securityVerificationError || 'Security verification error. Please refresh and try again.');
    setShowToastModal(true);
    setChatState(prev => ({
      ...prev,
      turnstileToken: null,
      pendingGeneration: false,
      showTurnstile: false
    }));
  };

  const handleTurnstileExpire = () => {
    setChatState(prev => ({
      ...prev,
      turnstileToken: null,
      showTurnstile: true
    }));
  };

  // Handle error dismissal
  const handleErrorDismiss = () => {
    setError(null);
    setNetworkError(false);
  };

  const handleErrorRetry = () => {
    setError(null);
    setNetworkError(false);
    
    // If there's no current input, try to use the last user message
    let inputToRetry = chatState.currentInput;
    if (!inputToRetry.trim() && chatState.messages.length > 0) {
      const lastUserMessage = [...chatState.messages].reverse().find(msg => msg.type === 'user');
      if (lastUserMessage) {
        inputToRetry = lastUserMessage.content;
        setChatState(prev => ({ ...prev, currentInput: inputToRetry }));
      }
    }
    
    if (inputToRetry.trim().length >= 10) {
      handleSendMessage();
    } else {
      setError('Please enter a valid message to retry');
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* Header */}
      <ChatHeader
        selectedModel={chatState.selectedModel}
        availableModels={AVAILABLE_MODELS}
        onModelChange={handleModelChange}
        commonText={commonText}
      />

      {/* Messages */}
      <MessageList
        messages={chatState.messages}
        isTyping={chatState.isTyping}
        commonText={commonText}
      />

      {/* Security Verification */}
      {chatState.showTurnstile && (
        <SecurityVerification
          turnstileRef={turnstileRef}
          onVerify={handleTurnstileVerify}
          onError={handleTurnstileError}
          onExpire={handleTurnstileExpire}
          pendingGeneration={chatState.pendingGeneration}
          commonText={commonText}
        />
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={handleErrorRetry}
          onDismiss={handleErrorDismiss}
        />
      )}

      {/* Input Area */}
      <InputArea
        value={chatState.currentInput}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        isLoading={chatState.isLoading}
        placeholder={commonText.placeholderText || "Type your coding question..."}
        commonText={commonText}
      />
    </div>
  );
};

export default NewChatInterface;