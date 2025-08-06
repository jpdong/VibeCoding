import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickActions from '../QuickActions';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

const mockCommonText = {
  copyMessage: 'Copy message',
  copied: 'Copied!',
  regenerateResponse: 'Regenerate response',
  regenerating: 'Regenerating...',
  goodResponse: 'Good response',
  poorResponse: 'Poor response'
};

describe('QuickActions', () => {
  const defaultProps = {
    messageId: 'test-message-1',
    content: 'This is a test message content',
    onCopy: jest.fn(),
    onRegenerate: jest.fn(),
    onFeedback: jest.fn(),
    commonText: mockCommonText
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all action buttons', () => {
    render(<QuickActions {...defaultProps} />);
    
    expect(screen.getByTitle('Copy message')).toBeInTheDocument();
    expect(screen.getByTitle('Regenerate response')).toBeInTheDocument();
    expect(screen.getByTitle('Good response')).toBeInTheDocument();
    expect(screen.getByTitle('Poor response')).toBeInTheDocument();
  });

  it('calls onCopy when copy button is clicked', async () => {
    render(<QuickActions {...defaultProps} />);
    
    const copyButton = screen.getByTitle('Copy message');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('This is a test message content');
      expect(defaultProps.onCopy).toHaveBeenCalledWith('This is a test message content');
    });
  });

  it('shows copied state after successful copy', async () => {
    render(<QuickActions {...defaultProps} />);
    
    const copyButton = screen.getByTitle('Copy message');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByTitle('Copied!')).toBeInTheDocument();
    });
  });

  it('calls onRegenerate when regenerate button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    
    const regenerateButton = screen.getByTitle('Regenerate response');
    fireEvent.click(regenerateButton);
    
    expect(defaultProps.onRegenerate).toHaveBeenCalledWith('test-message-1');
  });

  it('shows regenerating state when isRegenerating is true', () => {
    render(<QuickActions {...defaultProps} isRegenerating={true} />);
    
    expect(screen.getByTitle('Regenerating...')).toBeInTheDocument();
    
    const regenerateButton = screen.getByTitle('Regenerating...');
    expect(regenerateButton).toBeDisabled();
  });

  it('calls onFeedback with like when like button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    
    const likeButton = screen.getByTitle('Good response');
    fireEvent.click(likeButton);
    
    expect(defaultProps.onFeedback).toHaveBeenCalledWith('test-message-1', 'like');
  });

  it('calls onFeedback with dislike when dislike button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    
    const dislikeButton = screen.getByTitle('Poor response');
    fireEvent.click(dislikeButton);
    
    expect(defaultProps.onFeedback).toHaveBeenCalledWith('test-message-1', 'dislike');
  });

  it('shows active state for like button after clicking', () => {
    render(<QuickActions {...defaultProps} />);
    
    const likeButton = screen.getByTitle('Good response');
    fireEvent.click(likeButton);
    
    expect(likeButton).toHaveClass('text-green-600', 'bg-green-50');
  });

  it('shows active state for dislike button after clicking', () => {
    render(<QuickActions {...defaultProps} />);
    
    const dislikeButton = screen.getByTitle('Poor response');
    fireEvent.click(dislikeButton);
    
    expect(dislikeButton).toHaveClass('text-red-600', 'bg-red-50');
  });

  it('handles clipboard write failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Clipboard error'));
    
    render(<QuickActions {...defaultProps} />);
    
    const copyButton = screen.getByTitle('Copy message');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('resets copied state after timeout', async () => {
    jest.useFakeTimers();
    
    render(<QuickActions {...defaultProps} />);
    
    const copyButton = screen.getByTitle('Copy message');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByTitle('Copied!')).toBeInTheDocument();
    });
    
    // Fast-forward time
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(screen.getByTitle('Copy message')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
});