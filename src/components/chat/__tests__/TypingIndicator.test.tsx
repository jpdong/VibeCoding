import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TypingIndicator from '../TypingIndicator';

const mockCommonText = {
  aiThinking: 'AI is thinking...'
};

describe('TypingIndicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default message', () => {
    render(<TypingIndicator />);
    
    expect(screen.getByText(/AI is thinking/)).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<TypingIndicator message="Custom thinking message" />);
    
    expect(screen.getByText(/Custom thinking message/)).toBeInTheDocument();
  });

  it('uses commonText message when provided', () => {
    render(<TypingIndicator commonText={mockCommonText} />);
    
    expect(screen.getByText(/AI is thinking/)).toBeInTheDocument();
  });

  it('renders animated dots', () => {
    render(<TypingIndicator />);
    
    const dots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('animate-bounce')
    );
    
    expect(dots).toHaveLength(3);
  });

  it('shows avatar with pulse animation', () => {
    render(<TypingIndicator />);
    
    const avatar = screen.getByText('🤖').parentElement;
    expect(avatar).toHaveClass('animate-pulse');
  });

  it('animates dots with different delays', () => {
    render(<TypingIndicator />);
    
    const dots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('animate-bounce')
    );
    
    expect(dots[0]).toHaveStyle('animation-delay: 0ms');
    expect(dots[1]).toHaveStyle('animation-delay: 0.2s');
    expect(dots[2]).toHaveStyle('animation-delay: 0.4s');
  });

  it('updates dots text periodically', () => {
    render(<TypingIndicator commonText={mockCommonText} />);
    
    // Initially should show message without dots or with empty dots
    expect(screen.getByText(/AI is thinking/)).toBeInTheDocument();
    
    // Advance timer to trigger dot animation
    jest.advanceTimersByTime(500);
    
    // Should still be visible (dots are added via state)
    expect(screen.getByText(/AI is thinking/)).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<TypingIndicator />);
    
    const container = screen.getByText('🤖').closest('.flex');
    expect(container).toHaveClass('justify-start', 'mb-4');
    
    const messageContainer = screen.getByText(/AI is thinking/).parentElement;
    expect(messageContainer).toHaveClass('bg-white', 'border', 'border-gray-200', 'rounded-2xl');
  });

  it('handles missing commonText gracefully', () => {
    render(<TypingIndicator commonText={undefined} />);
    
    expect(screen.getByText(/AI is thinking/)).toBeInTheDocument();
  });

  it('prioritizes custom message over commonText', () => {
    render(<TypingIndicator message="Custom message" commonText={mockCommonText} />);
    
    expect(screen.getByText(/Custom message/)).toBeInTheDocument();
    expect(screen.queryByText(/AI is thinking/)).not.toBeInTheDocument();
  });
});