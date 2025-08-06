'use client'
import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  className, 
  children 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <code className={className}>
          {children}
        </code>
      </pre>
      
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 p-2 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${
          copied 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
        title={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <ClipboardDocumentIcon className="h-4 w-4" />
        )}
      </button>
      
      {/* Language Label */}
      {language && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {language}
        </div>
      )}
    </div>
  );
};

export default CodeBlock;