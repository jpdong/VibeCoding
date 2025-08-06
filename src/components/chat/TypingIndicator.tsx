'use client'
import React, { useState, useEffect } from 'react';

interface TypingIndicatorProps {
  message?: string;
  commonText?: any;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  message,
  commonText
}) => {
  const displayMessage = message || commonText?.aiThinking || 'AI is thinking...';
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3">
        {/* Avatar with pulse animation */}
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-sm">🤖</span>
        </div>
        
        {/* Typing Animation */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-3">
            {/* Animated dots */}
            <div className="flex space-x-1">
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
              />
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
              />
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
              />
            </div>
            
            {/* Dynamic message */}
            <span className="text-sm text-gray-500">
              {displayMessage}{dots}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;