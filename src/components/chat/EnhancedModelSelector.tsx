'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDownIcon, LockClosedIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAuth, useModelAccess } from '~/context/auth-context';
import { Model } from '~/types/auth';
import { ModelOption } from '~/types/chat';
import ComingSoonModal from '~/components/subscription/ComingSoonModal';

interface EnhancedModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  commonText: any;
}

const EnhancedModelSelector: React.FC<EnhancedModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  commonText
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const { isAuthenticated, login } = useAuth();
  const { canAccessModel, hasPremium } = useModelAccess();

  // Fetch models from API
  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setModels(data.models);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      // Use fallback models if API fails
      setModels(getFallbackModels());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const getFallbackModels = (): Model[] => [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most coding tasks',
      provider: 'openai',
      tier: 'free',
      available: true,
      accessible: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable model for complex coding problems',
      provider: 'openai',
      tier: 'premium',
      available: true,
      accessible: hasPremium,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const currentModel = models.find(model => model.id === selectedModel);

  const handleModelSelect = (model: Model) => {
    // Check if user can access this model
    if (!canAccessModel(model.tier)) {
      if (!isAuthenticated) {
        setShowLoginPrompt(true);
        return;
      }
      
      if (model.tier === 'premium' && !hasPremium) {
        setShowComingSoon(true);
        return;
      }
    }

    onModelChange(model.id);
    setIsOpen(false);
    
    // Persist selection
    localStorage.setItem('selectedModel', model.id);
  };

  const handleLoginPrompt = async () => {
    setShowLoginPrompt(false);
    await login();
  };

  const getModelIcon = (model: Model) => {
    if (model.tier === 'premium') {
      return <StarIcon className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  const getModelBadge = (model: Model) => {
    if (model.tier === 'premium') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Free
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-[200px]"
        >
          <div className="flex items-center space-x-2 flex-1">
            {currentModel && getModelIcon(currentModel)}
            <span className="truncate">
              {currentModel?.name || commonText.selectModel || 'Select Model'}
            </span>
            {currentModel && (
              <div className="ml-auto">
                {getModelBadge(currentModel)}
              </div>
            )}
          </div>
          <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  {commonText.availableModels || 'Available Models'}
                </div>
                
                {models.map((model) => {
                  const accessible = canAccessModel(model.tier);
                  const isSelected = selectedModel === model.id;
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      disabled={!model.available}
                      className={`w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors ${
                        !model.available ? 'opacity-50 cursor-not-allowed' : ''
                      } ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getModelIcon(model)}
                            <span className={`font-medium text-sm ${
                              isSelected ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {model.name}
                            </span>
                            {!accessible && (
                              <LockClosedIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {model.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {getModelBadge(model)}
                            {!accessible && (
                              <span className="text-xs text-gray-400">
                                {!isAuthenticated 
                                  ? commonText.loginRequired || 'Login required'
                                  : commonText.premiumRequired || 'Premium required'
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {models.length === 0 && (
                  <div className="px-3 py-4 text-center text-gray-500">
                    <p className="text-sm">
                      {commonText.noModelsAvailable || 'No models available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {commonText.loginRequiredTitle || 'Login Required'}
            </h3>
            <p className="text-gray-600 mb-4">
              {commonText.loginRequiredMessage || 'Please log in to access premium AI models and features.'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {commonText.cancelButton || 'Cancel'}
              </button>
              <button
                onClick={handleLoginPrompt}
                className="flex-1 px-4 py-2 bg-[#ffa11b] text-white rounded-md hover:bg-[#f79100] transition-colors"
              >
                {commonText.loginButton || 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        commonText={commonText}
      />
    </>
  );
};

export default EnhancedModelSelector;