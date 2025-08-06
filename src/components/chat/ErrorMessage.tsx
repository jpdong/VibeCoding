'use client'
import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry, 
  onDismiss 
}) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="max-w-md bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Something went wrong
            </h3>
            <p className="text-sm text-red-700 mb-3">
              {error}
            </p>
            
            <div className="flex space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-md transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Retry</span>
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;