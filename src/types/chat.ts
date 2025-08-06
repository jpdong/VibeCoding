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

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
  tier?: 'free' | 'premium';
  accessible?: boolean;
  provider?: string;
}