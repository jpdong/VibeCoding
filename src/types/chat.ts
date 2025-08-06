// Chat interface types and models

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  isStreaming?: boolean;
  metadata?: {
    tokenCount?: number;
    processingTime?: number;
  };
}

export interface ChatState {
  messages: Message[];
  currentInput: string;
  selectedModel: string;
  isLoading: boolean;
  isTyping: boolean;
  turnstileToken: string | null;
  showTurnstile: boolean;
  pendingGeneration: boolean;
}

export interface ChatConfig {
  selectedModel: string;
  theme: 'light' | 'dark';
  language: string;
  autoScroll: boolean;
  showTimestamps: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex tasks',
    available: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    available: true
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    description: 'Anthropic\'s advanced reasoning model',
    available: false
  }
];