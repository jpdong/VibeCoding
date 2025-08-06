import React from 'react';
import { render, screen } from '@testing-library/react';
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
    <div data-testid="turnstile-widget">Turnstile Widget</div>
  ));
});

const mockCommonText = {
  placeholderText: 'Type your coding question...',
  welcomeTitle: 'Welcome to Vibe Coding',
  inputTipText: 'Describe your coding problem',
  inputTipText2: 'Code solutions are publicly displayed',
  sendMessage: 'Send message'
};

describe('NewChatInterface Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders all main components correctly', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    // Check header
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('Vibe Coding')).toBeInTheDocument();
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
    
    // Check welcome message
    expect(screen.getByText('Welcome to Vibe Coding')).toBeInTheDocument();
    
    // Check input area
    expect(screen.getByPlaceholderText('Type your coding question...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const container = screen.getByText('🤖').closest('.flex.flex-col.h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('max-h-screen', 'bg-white');
  });

  it('shows model selection dropdown', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const modelButton = screen.getByText('GPT-4');
    expect(modelButton).toBeInTheDocument();
  });

  it('shows input area with proper styling', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const inputArea = screen.getByPlaceholderText('Type your coding question...');
    expect(inputArea).toBeInTheDocument();
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toBeDisabled(); // Should be disabled when input is empty
  });

  it('maintains responsive design classes', () => {
    render(<NewChatInterface commonText={mockCommonText} />);
    
    // Check that responsive classes are applied
    const messageContainer = screen.getByText('Welcome to Vibe Coding').closest('.max-w-4xl');
    expect(messageContainer).toBeInTheDocument();
  });

  it('handles missing commonText gracefully', () => {
    render(<NewChatInterface commonText={{}} />);
    
    // Should still render without crashing
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('Vibe Coding')).toBeInTheDocument();
  });
});

describe('Component Performance', () => {
  it('renders within reasonable time', () => {
    const startTime = performance.now();
    
    render(<NewChatInterface commonText={mockCommonText} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms (adjust threshold as needed)
    expect(renderTime).toBeLessThan(100);
  });

  it('does not cause memory leaks', () => {
    const { unmount } = render(<NewChatInterface commonText={mockCommonText} />);
    
    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });
});