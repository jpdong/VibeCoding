import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageList from '../MessageList';
import { Message } from '~/types/chat';

const mockCommonText = {
  welcomeTitle: 'Welcome to Vibe Coding',
  inputTipText: 'Describe your coding problem',
  inputTipText2: 'Code solutions are publicly displayed',
  aiThinking: 'AI is thinking...'
};

describe('MessageList', () => {
  const defaultProps = {
    messages: [] as Message[],
    isTyping: false,
    commonText: mockCommonText
  };

  it('renders welcome message when no messages', () => {
    render(<MessageList {...defaultProps} />);
    
    expect(screen.getByText('Welcome to Vibe Coding')).toBeInTheDocument();
    expect(screen.getByText('Describe your coding problem')).toBeInTheDocument();
    expect(screen.getByText('Code solutions are publicly displayed')).toBeInTheDocument();
  });

  it('renders user and assistant messages', () => {
    const messages: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'Hello, how can I create a React component?',
        timestamp: new Date('2023-01-01T10:00:00Z')
      },
      {
        id: '2',
        type: 'assistant',
        content: 'Here is how you can create a React component...',
        timestamp: new Date('2023-01-01T10:01:00Z'),
        model: 'gpt-4'
      }
    ];

    render(<MessageList {...defaultProps} messages={messages} />);
    
    expect(screen.getByText('Hello, how can I create a React component?')).toBeInTheDocument();
    expect(screen.getByText('Here is how you can create a React component...')).toBeInTheDocument();
  });

  it('shows typing indicator when isTyping is true', () => {
    render(<MessageList {...defaultProps} isTyping={true} />);
    
    expect(screen.getByText('AI is thinking...')).toBeInTheDocument();
  });

  it('does not show typing indicator when isTyping is false', () => {
    render(<MessageList {...defaultProps} isTyping={false} />);
    
    expect(screen.queryByText('AI is thinking...')).not.toBeInTheDocument();
  });

  it('applies animation classes to messages', () => {
    const messages: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'Test message',
        timestamp: new Date()
      }
    ];

    render(<MessageList {...defaultProps} messages={messages} />);
    
    const messageContainer = screen.getByText('Test message').closest('.animate-fadeIn');
    expect(messageContainer).toBeInTheDocument();
  });

  it('scrolls to bottom when new messages are added', () => {
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(<MessageList {...defaultProps} />);
    
    const messages: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'New message',
        timestamp: new Date()
      }
    ];

    rerender(<MessageList {...defaultProps} messages={messages} />);
    
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('handles empty message content gracefully', () => {
    const messages: Message[] = [
      {
        id: '1',
        type: 'user',
        content: '',
        timestamp: new Date()
      }
    ];

    render(<MessageList {...defaultProps} messages={messages} />);
    
    // Should not crash and should render the message container
    expect(screen.getByText('10:00')).toBeInTheDocument(); // timestamp
  });

  it('formats timestamps correctly', () => {
    const messages: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'Test message',
        timestamp: new Date('2023-01-01T14:30:00Z')
      }
    ];

    render(<MessageList {...defaultProps} messages={messages} />);
    
    // Check that timestamp is formatted (exact format may vary by locale)
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });
});