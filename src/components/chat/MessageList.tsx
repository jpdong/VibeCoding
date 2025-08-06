'use client'
import React, { useEffect, useRef, useMemo, memo } from 'react';
import { Message } from '~/types/chat';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  commonText: any;
}

const MessageList: React.FC<MessageListProps> = memo(({
  messages,
  isTyping,
  commonText
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping]);

  // Memoize welcome content to prevent unnecessary re-renders
  const welcomeContent = useMemo(() => (
    <div className="flex items-center justify-center h-96 text-gray-500">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">💬</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          {commonText.welcomeTitle || 'Welcome to Vibe Coding'}
        </h2>
        <p className="text-lg text-gray-600 mb-2">
          {commonText.inputTipText || 'Describe your coding problem, include relevant code snippets for better assistance.'}
        </p>
        <p className="text-sm text-gray-500">
          {commonText.inputTipText2 || 'Code solutions are publicly displayed and indexed by search engines.'}
        </p>
      </div>
    </div>
  ), [commonText.welcomeTitle, commonText.inputTipText, commonText.inputTipText2]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {messages.length === 0 && welcomeContent}
        
        {messages.map((message) => (
          <div key={message.id} className="animate-fadeIn">
            {message.type === 'user' ? (
              <UserMessage message={message} />
            ) : (
              <AssistantMessage message={message} commonText={commonText} />
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="animate-fadeIn">
            <TypingIndicator commonText={commonText} />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;