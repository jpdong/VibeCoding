'use client'
import React, { memo, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '~/types/chat';
import QuickActions from './QuickActions';

interface AssistantMessageProps {
  message: Message;
  commonText: any;
}

const AssistantMessage: React.FC<AssistantMessageProps> = memo(({ 
  message, 
  commonText 
}) => {
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: Show toast notification
  }, []);

  const handleRegenerate = useCallback((messageId: string) => {
    // TODO: Implement regenerate functionality
    console.log('Regenerate message:', messageId);
  }, []);

  const handleFeedback = useCallback((messageId: string, type: 'like' | 'dislike') => {
    // TODO: Implement feedback functionality
    console.log('Feedback:', messageId, type);
  }, []);

  return (
    <div className="flex justify-start mb-4 group chat-message-assistant">
      <div className="max-w-[95%] sm:max-w-[90%] lg:max-w-[75%] w-full">
        <div className="flex items-start space-x-2 sm:space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs sm:text-sm">🤖</span>
          </div>
          
          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
              <div className="prose prose-sm max-w-none text-sm sm:text-base">
                <Markdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="relative">
                          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                          <button
                            onClick={() => handleCopy(String(children))}
                            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            </div>
            
            {/* Timestamp and Actions */}
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
                {message.model && (
                  <span className="ml-2 text-gray-400">• {message.model}</span>
                )}
              </div>
              
              <QuickActions
                messageId={message.id}
                content={message.content}
                onCopy={handleCopy}
                onRegenerate={handleRegenerate}
                onFeedback={handleFeedback}
                commonText={commonText}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AssistantMessage.displayName = 'AssistantMessage';

export default AssistantMessage;