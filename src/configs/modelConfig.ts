export interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
  provider: 'openrouter';
  maxTokens?: number;
  temperature: number;
  isPremium: boolean;
  description: string;
  features: string[];
  costPer1M?: string;
}

export const availableModels: ModelConfig[] = [
  // Free Models (显示在前面)
  {
    id: 'kimi-k2',
    name: 'moonshotai/kimi-k2',
    displayName: 'Kimi K2',
    provider: 'openrouter',
    maxTokens: 4096,
    temperature: 0.7,
    isPremium: false,
    description: 'Top-tier Chinese AI model, 1T parameters',
    features: ['Free to use', '1M context', 'Chinese/English'],
    costPer1M: 'Free'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'google/gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    provider: 'openrouter',
    maxTokens: 4096,
    temperature: 0.7,
    isPremium: false,
    description: 'Fast and efficient Google model',
    features: ['Free to use', '1M context', 'Lightning fast'],
    costPer1M: 'Free'
  },
  {
    id: 'deepseek-chat-v3',
    name: 'deepseek/deepseek-chat-v3-0324',
    displayName: 'DeepSeek Chat V3',
    provider: 'openrouter',
    maxTokens: 4096,
    temperature: 0.7,
    isPremium: false,
    description: 'Powerful free model for coding and reasoning',
    features: ['Free to use', '128K context', 'Code expert'],
    costPer1M: 'Free'
  },
  {
    id: 'deepseek-r1',
    name: 'deepseek/deepseek-r1-0528',
    displayName: 'DeepSeek R1',
    provider: 'openrouter',
    maxTokens: 4096,
    temperature: 0.7,
    isPremium: false,
    description: 'Advanced reasoning model for research',
    features: ['Free to use', '64K context', 'Research focused'],
    costPer1M: 'Free'
  },
  {
    id: 'qwen3-coder',
    name: 'qwen/qwen3-coder',
    displayName: 'Qwen 3 Coder',
    provider: 'openrouter',
    maxTokens: 4096,
    temperature: 0.7,
    isPremium: false,
    description: 'Specialized coding model from Alibaba',
    features: ['Free to use', '128K context', 'Code generation'],
    costPer1M: 'Free'
  },
  {
    id: 'gpt-5-mini',
    name: 'openai/gpt-5-mini',
    displayName: 'GPT-5 Mini',
    provider: 'openrouter',
    maxTokens: 4096,
    temperature: 0.7,
    isPremium: false,
    description: 'Compact version of GPT-5 for efficiency',
    features: ['Free to use', '128K context', 'Fast response'],
    costPer1M: 'Free'
  },
  {
    id: 'claude-3.5-haiku',
    name: 'anthropic/claude-3.5-haiku',
    displayName: 'Claude 3.5 Haiku',
    provider: 'openrouter',
    maxTokens: 4096,
    temperature: 0.7,
    isPremium: false,
    description: 'Fast and efficient Claude model',
    features: ['Free to use', '200K context', 'Speed optimized'],
    costPer1M: 'Free'
  },
  
  // Premium Models (显示在后面)
  {
    id: 'gemini-2.5-pro',
    name: 'google/gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    provider: 'openrouter',
    maxTokens: 8192,
    temperature: 0.7,
    isPremium: true,
    description: 'Google\'s most advanced multimodal model',
    features: ['2M context', 'Multimodal', 'Advanced reasoning'],
    costPer1M: '$7.50'
  },
  {
    id: 'gpt-5',
    name: 'openai/gpt-5',
    displayName: 'GPT-5',
    provider: 'openrouter',
    maxTokens: 8192,
    temperature: 0.7,
    isPremium: true,
    description: 'OpenAI\'s next-generation flagship model',
    features: ['Breakthrough reasoning', '2M context', 'Multimodal'],
    costPer1M: '$15.00'
  },
  {
    id: 'claude-sonnet-4',
    name: 'anthropic/claude-sonnet-4',
    displayName: 'Claude Sonnet 4',
    provider: 'openrouter',
    maxTokens: 8192,
    temperature: 0.7,
    isPremium: true,
    description: 'Anthropic\'s most advanced AI model',
    features: ['Superior reasoning', '1M context', 'Research-grade'],
    costPer1M: '$12.00'
  }
];

export const getModelById = (id: string): ModelConfig | undefined => {
  return availableModels.find(model => model.id === id);
};

export const getDefaultModel = (): ModelConfig => {
  // Return the first free model as default for better user experience
  const freeModels = getFreeModels();
  return freeModels.length > 0 ? freeModels[0] : availableModels[0];
};

export const getFreeModels = (): ModelConfig[] => {
  return availableModels.filter(model => !model.isPremium);
};

export const getPremiumModels = (): ModelConfig[] => {
  return availableModels.filter(model => model.isPremium);
};