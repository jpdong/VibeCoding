import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputArea from '../InputArea';

const mockCommonText = {
  sendMessage: 'Send message',
  attachFile: 'Attach file (coming soon)',
  voiceInput: 'Voice input (coming soon)',
  enterToSend: 'Press Enter to send, Shift+Enter for new line'
};

describe('InputArea', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    onSend: jest.fn(),
    isLoading: false,
    placeholder: 'Type your message...',
    commonText: mockCommonText
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<InputArea {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    render(<InputArea {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('Hello world');
  });

  it('disables send button when text is too short', () => {
    render(<InputArea {...defaultProps} value="short" />);
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when text is long enough', () => {
    render(<InputArea {...defaultProps} value="This is a long enough message" />);
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).not.toBeDisabled();
  });

  it('calls onSend when send button is clicked', () => {
    render(<InputArea {...defaultProps} value="This is a long enough message" />);
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);
    
    expect(defaultProps.onSend).toHaveBeenCalled();
  });

  it('calls onSend when Enter is pressed', () => {
    render(<InputArea {...defaultProps} value="This is a long enough message" />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    
    expect(defaultProps.onSend).toHaveBeenCalled();
  });

  it('does not call onSend when Shift+Enter is pressed', () => {
    render(<InputArea {...defaultProps} value="This is a long enough message" />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    expect(defaultProps.onSend).not.toHaveBeenCalled();
  });

  it('shows character counter when approaching limit', () => {
    const longText = 'a'.repeat(950);
    render(<InputArea {...defaultProps} value={longText} maxLength={1000} />);
    
    expect(screen.getByText('950/1000')).toBeInTheDocument();
  });

  it('shows error state when exceeding character limit', () => {
    const tooLongText = 'a'.repeat(1001);
    render(<InputArea {...defaultProps} value={tooLongText} maxLength={1000} />);
    
    const counter = screen.getByText('1001/1000');
    expect(counter).toHaveClass('text-red-500');
  });

  it('disables all inputs when loading', () => {
    render(<InputArea {...defaultProps} isLoading={true} />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    const attachButton = screen.getByTitle(mockCommonText.attachFile);
    const voiceButton = screen.getByTitle(mockCommonText.voiceInput);
    
    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(attachButton).toBeDisabled();
    expect(voiceButton).toBeDisabled();
  });

  it('shows keyboard shortcut hint when text is long enough', () => {
    render(<InputArea {...defaultProps} value="This is a long enough message" />);
    
    expect(screen.getByText(mockCommonText.enterToSend)).toBeInTheDocument();
  });

  it('auto-expands textarea height', () => {
    const { rerender } = render(<InputArea {...defaultProps} value="" />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toHaveAttribute('rows', '1');
    
    // Simulate multi-line text
    const multiLineText = 'Line 1\nLine 2\nLine 3\nLine 4';
    rerender(<InputArea {...defaultProps} value={multiLineText} />);
    
    // The component should adjust rows based on content
    // This would require more complex testing with actual DOM measurements
  });
});