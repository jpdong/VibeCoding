'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SparklesIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { ModelConfig, availableModels, getModelById } from '~/configs/modelConfig';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  userType?: 'guest' | 'free' | 'premium';
  className?: string;
}

const ModelSelector = ({ 
  selectedModelId, 
  onModelChange, 
  userType = 'guest',
  className = '' 
}: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedModel = getModelById(selectedModelId) || availableModels[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (modelId: string) => {
    const model = getModelById(modelId);
    if (!model) return;

    // Check if user can access premium models
    if (model.isPremium && userType !== 'premium') {
      // Show upgrade prompt or handle premium model access
      return;
    }

    onModelChange(modelId);
    setIsOpen(false);
  };

  const getAvailableModels = () => {
    if (userType === 'premium') {
      return availableModels;
    }
    // For guests and free users, show all models but with restrictions
    return availableModels;
  };

  const isModelDisabled = (model: ModelConfig) => {
    return model.isPremium && userType !== 'premium';
  };

  const getModelIcon = (model: ModelConfig) => {
    if (model.isPremium) {
      return userType === 'premium' ? (
        <SparklesIcon className="h-4 w-4 text-yellow-500" />
      ) : (
        <LockClosedIcon className="h-4 w-4 text-gray-400" />
      );
    }
    return (
      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
        <span className="text-white text-xs font-bold">F</span>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Model Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {getModelIcon(selectedModel)}
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              {selectedModel.displayName}
            </div>
            <div className="text-xs text-gray-500">
              {selectedModel.description}
            </div>
          </div>
        </div>
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <div className="py-1">
            {/* Free Models Section - 显示在前面 */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Free Models
            </div>
            {getAvailableModels()
              .filter(model => !model.isPremium)
              .map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 cursor-pointer transition-colors ${
                    selectedModelId === model.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getModelIcon(model)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {model.displayName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {model.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {model.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {(model as any).costPer1M && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded font-medium">
                            {(model as any).costPer1M}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

            {/* Premium Models Section - 显示在后面 */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 border-t border-gray-100 mt-1">
              Premium Models
            </div>
            {getAvailableModels()
              .filter(model => model.isPremium)
              .map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  disabled={isModelDisabled(model)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                    selectedModelId === model.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  } ${
                    isModelDisabled(model) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getModelIcon(model)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {model.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {model.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {model.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                          {(model as any).costPer1M && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded font-medium">
                              {(model as any).costPer1M}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isModelDisabled(model) && (
                      <span className="text-xs text-blue-600 font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                </button>
              ))}
          </div>
          
          {/* Upgrade Prompt for Non-Premium Users */}
          {userType !== 'premium' && (
            <div className="border-t border-gray-100 p-3 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">
                  Unlock premium models with advanced capabilities
                </p>
                <button
                  onClick={() => {
                    // Handle upgrade action
                    window.dispatchEvent(new CustomEvent('openPricingModal'));
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;