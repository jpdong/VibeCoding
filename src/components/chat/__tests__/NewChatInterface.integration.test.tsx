import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewChatInterface from '../NewChatInterface';

// Mock the CommonContext
const mockContextValue = {
  setShowLoadingModal: jest.fn(),
  userData: { user_id: 'test-user', email: 'test@example.com' },
  setShowLoginModal: jest.fn(),
  setToastText: jest.fn(),
  setShowToastModal: jest.fn()
};

jest.mock('~/context/common-context', () => ({
  useCommonContext: () => mockContextValue
}));

// Mock TurnstileWidget
jest.mock('~/components/TurnstileWidget', () => {
  return React.forwardRef<any, any>((props, ref) => (
    <div data-testid="turnstile-widget">
      <button onClick={() => props.onVerify('mock-token')}>
        Verify
      </button>
    </div>
  ));
});

// Mock fetch
global.fetch = jest.fn();

const mockCommonText = {
  placeholderText: 'Type your coding question...',
  welcomeTitle: 'Welcome to Vibe Coding',
  inputTipText: 'Describe your coding problem',
  inputTipText2: 'Code solutions are publicly displayed',
  securityVerificationRequired: 'Please complete security verification first.',
  securityVerificationFailed: 'Security verification failed. Please try again.',
  sendMessage: 'Send message',
  aiThinking: 'AI is thinking...'
};

describe('NewChatInterface Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    localStorage.clear();
  });

  it('renders initial state correctly', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('Vibe Coding')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Vibe Coding')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your coding question...')).toBeInTheDocument();
  });

  it('prevents sending message when input is too short', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const input = screen.getByPlaceholderText('Type your coding question...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    fireEvent.change(input, { target: { value: 'short' } });
    fireEvent.click(sendButton);
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows security verification when sending message without token', async () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const input = screen.getByPlaceholderText('Type your coding question...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    fireEvent.change(input, { target: { value: 'This is a long enough message for testing' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });
    
    expect(mockContextValue.setToastText).toHaveBeenCalledWith(mockCommonText.securityVerificationRequired);
    expect(mockContextValue.setShowToastModal).toHaveBeenCalledWith(true);
  });

  it('sends message after security verification', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ value: new TextEncoder().encode('Hello'), done: false })
            .mockResolvedValueOnce({ value: new TextEncoder().encode(' world'), done: false })
            .mockResolvedValueOnce({ done: true })
        })
      }
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const input = screen.getByPlaceholderText('Type your coding question...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Enter message
    fireEvent.change(input, { target: { value: 'This is a test message' } });
    fireEvent.click(sendButton);
    
    // Complete verification
    await waitFor(() => {
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });
    
    const verifyButton = screen.getByText('Verify');
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/chat/generateTextStream', {
        method: 'POST',
        body: JSON.stringify({
          textStr: 'This is a test message',
          user_id: 'test-user',
          turnstileToken: 'mock-token'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal)
      });
    });
  });

  it('handles API errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const input = screen.getByPlaceholderText('Type your coding question...');
    
    // Set up with token to skip verification
    fireEvent.change(input, { target: { value: 'This is a test message' } });
    
    // Manually trigger verification first
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });
    
    const verifyButton = screen.getByText('Verify');
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });
  });

  it('changes model selection', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const modelButton = screen.getByText('GPT-4');
    fireEvent.click(modelButton);
    
    const gpt35Option = screen.getByText('GPT-3.5 Turbo');
    fireEvent.click(gpt35Option);
    
    expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
  });

  it('loads saved input from localStorage on mount', () => {
    localStorage.setItem('textStr', 'Saved message');
    
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const input = screen.getByPlaceholderText('Type your coding question...');
    expect(input).toHaveValue('Saved message');
    
    // Should remove from localStorage after loading
    expect(localStorage.getItem('textStr')).toBeNull();
  });

  it('loads saved model selection from localStorage', () => {
    localStorage.setItem('selectedModel', 'gpt-3.5-turbo');
    
    render(<NewChatInterface commonText={mockCommonText} />);
    
    expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
  });

  it('handles network timeout', async () => {
    const abortError = new Error('Request timeout');
    abortError.name = 'AbortError';
    
    (fetch as jest.Mock).mockRejectedValueOnce(abortError);
    
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const input = screen.getByPlaceholderText('Type your coding question...');
    fireEvent.change(input, { target: { value: 'This is a test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);
    
    // Complete verification
    await waitFor(() => {
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });
    
    const verifyButton = screen.getByText('Verify');
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Request timed out/)).toBeInTheDocument();
    });
  });

  it('shows typing indicator during response generation', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ value: new TextEncoder().encode('Response'), done: false })
            .mockResolvedValueOnce({ done: true })
        })
      }
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const input = screen.getByPlaceholderText('Type your coding question...');
    fireEvent.change(input, { target: { value: 'This is a test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);
    
    // Complete verification
    await waitFor(() => {
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });
    
    const verifyButton = screen.getByText('Verify');
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(screen.getByText('AI is thinking...')).toBeInTheDocument();
    });
  });
});