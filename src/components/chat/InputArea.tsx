'use client'
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder: string;
  maxLength?: number;
  minLength?: number;
  commonText?: any;
}

const InputArea: React.FC<InputAreaProps> = memo(({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder,
  maxLength = 1000,
  minLength = 10,
  commonText
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = 24; // Approximate line height
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), 1), 6);
      setRows(newRows);
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim().length >= minLength && !isLoading) {
        onSend();
      }
    }
  }, [value, minLength, isLoading, onSend]);

  const canSend = value.trim().length >= minLength && !isLoading;
  const remainingChars = maxLength - value.length;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="relative">
          {/* Main Input Container */}
          <div className="flex items-end space-x-2 sm:space-x-3 bg-gray-50 rounded-2xl p-2.5 sm:p-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all chat-input-container">
            {/* Attachment Button */}
            <button
              type="button"
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
              title={commonText?.attachFile || "Attach file (coming soon)"}
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>

            {/* Input Area */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                className="w-full resize-none bg-transparent border-0 px-0 py-2 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500 text-base leading-6"
                disabled={isLoading}
                style={{ minHeight: '24px' }}
              />
            </div>

            {/* Voice Button */}
            <button
              type="button"
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
              title={commonText?.voiceInput || "Voice input (coming soon)"}
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                canSend
                  ? 'bg-[#ffa11b] text-white hover:bg-[#f79100] shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={canSend ? (commonText?.sendMessage || 'Send message') : `Need at least ${minLength} characters`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Info Bar */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {/* Input Tips */}
              {value.length < minLength && value.length > 0 && (
                <span className="text-amber-600">
                  {minLength - value.length} more characters needed
                </span>
              )}
              
              {/* Keyboard Shortcut Hint */}
              {value.length >= minLength && (
                <span className="text-gray-400">
                  {commonText?.enterToSend || "Press Enter to send, Shift+Enter for new line"}
                </span>
              )}
            </div>

            {/* Character Counter */}
            <div className="text-xs">
              {(remainingChars < 100 || value.length > maxLength * 0.8) && (
                <span className={`${
                  remainingChars < 0 
                    ? 'text-red-500 font-medium' 
                    : remainingChars < 50 
                      ? 'text-amber-500' 
                      : 'text-gray-400'
                }`}>
                  {value.length}/{maxLength}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InputArea.displayName = 'InputArea';

export default InputArea;