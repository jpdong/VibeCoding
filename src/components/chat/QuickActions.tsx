'use client'
import React, { useState } from 'react';
import { 
  ClipboardDocumentIcon, 
  ArrowPathIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  messageId: string;
  content: string;
  onCopy: (content: string) => void;
  onRegenerate: (messageId: string) => void;
  onFeedback: (messageId: string, type: 'like' | 'dislike') => void;
  isRegenerating?: boolean;
  commonText?: any;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  messageId,
  content,
  onCopy,
  onRegenerate,
  onFeedback,
  isRegenerating = false,
  commonText
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy(content);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    onFeedback(messageId, type);
  };

  return (
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`p-1.5 rounded-md transition-all duration-200 chat-action-button ${
          copied 
            ? 'text-green-600 bg-green-50' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
        title={copied ? (commonText?.copied || 'Copied!') : (commonText?.copyMessage || 'Copy message')}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <ClipboardDocumentIcon className="h-4 w-4" />
        )}
      </button>

      {/* Regenerate Button */}
      <button
        onClick={() => onRegenerate(messageId)}
        disabled={isRegenerating}
        className={`p-1.5 rounded-md transition-all duration-200 chat-action-button ${
          isRegenerating
            ? 'text-blue-500 bg-blue-50 animate-spin'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
        title={isRegenerating ? (commonText?.regenerating || 'Regenerating...') : (commonText?.regenerateResponse || 'Regenerate response')}
      >
        <ArrowPathIcon className="h-4 w-4" />
      </button>

      {/* Like Button */}
      <button
        onClick={() => handleFeedback('like')}
        className={`p-1.5 rounded-md transition-all duration-200 chat-action-button ${
          feedback === 'like'
            ? 'text-green-600 bg-green-50'
            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
        }`}
        title={commonText?.goodResponse || "Good response"}
      >
        <HandThumbUpIcon className={`h-4 w-4 ${feedback === 'like' ? 'fill-current' : ''}`} />
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleFeedback('dislike')}
        className={`p-1.5 rounded-md transition-all duration-200 chat-action-button ${
          feedback === 'dislike'
            ? 'text-red-600 bg-red-50'
            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
        }`}
        title={commonText?.poorResponse || "Poor response"}
      >
        <HandThumbDownIcon className={`h-4 w-4 ${feedback === 'dislike' ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};

export default QuickActions;