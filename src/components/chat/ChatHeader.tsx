'use client'
import React, { useState } from 'react';
import { ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ModelOption } from '~/types/chat';

interface ChatHeaderProps {
  selectedModel: string;
  availableModels: ModelOption[];
  onModelChange: (modelId: string) => void;
  commonText: any;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  availableModels,
  onModelChange,
  commonText
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const currentModel = availableModels.find(model => model.id === selectedModel);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsModelDropdownOpen(false);
    // Persist model selection in localStorage
    localStorage.setItem('selectedModel', modelId);
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg sm:text-xl font-bold text-gray-900">🤖</span>
          <span className="text-base sm:text-lg font-semibold text-gray-900">Vibe Coding</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <span>{currentModel?.name || 'Select Model'}</span>
            <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isModelDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="py-2">
                {availableModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    disabled={!model.available}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !model.available ? 'opacity-50 cursor-not-allowed' : ''
                    } ${selectedModel === model.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </div>
                      {!model.available && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <button 
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {isModelDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsModelDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatHeader;