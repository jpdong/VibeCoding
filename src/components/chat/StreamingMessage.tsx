'use client'
import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '~/types/chat';

interface StreamingMessageProps {
  message: Message;
  isStreaming: boolean;
  commonText: any;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ 
  message, 
  isStreaming,
  commonText 
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (isStreaming) {
      // Simulate streaming effect by gradually revealing content
      let currentIndex = 0;
      const content = message.content;
      
      const streamInterval = setInterval(() => {
        if (currentIndex < content.length) {
          setDisplayedContent(content.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setShowCursor(false);
        }
      }, 20); // Adjust speed as needed

      return () => clearInterval(streamInterval);
    } else {
      setDisplayedContent(message.content);
      setShowCursor(false);
    }
  }, [message.content, isStreaming]);

  // Cursor blink effect
  useEffect(() => {
    if (!showCursor) return;
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  return (
    <div className="flex justify-start mb-4 group">
      <div className="max-w-[85%] lg:max-w-[75%]">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          
          {/* Message Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="prose prose-sm max-w-none">
                <Markdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  }}
                >
                  {displayedContent}
                </Markdown>
                
                {/* Streaming cursor */}
                {isStreaming && (
                  <span className={`inline-block w-2 h-4 bg-gray-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                )}
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="text-xs text-gray-500 mt-1">
              {isStreaming ? (
                <span className="text-blue-500">Generating...</span>
              ) : (
                <>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  {message.model && (
                    <span className="ml-2 text-gray-400">• {message.model}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;