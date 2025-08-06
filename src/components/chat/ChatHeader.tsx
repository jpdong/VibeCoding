'use client'
import React, { useState } from 'react';
import { ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import EnhancedModelSelector from './EnhancedModelSelector';

interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  commonText: any;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  onModelChange,
  commonText
}) => {

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg sm:text-xl font-bold text-gray-900">🤖</span>
          <span className="text-base sm:text-lg font-semibold text-gray-900">Vibe Coding</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Enhanced Model Selector */}
        <EnhancedModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          commonText={commonText}
        />

        {/* Settings Icon */}
        <button 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;