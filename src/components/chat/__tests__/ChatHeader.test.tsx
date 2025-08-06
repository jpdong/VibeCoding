import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatHeader from '../ChatHeader';
import { AVAILABLE_MODELS } from '~/types/chat';

const mockCommonText = {
  settings: 'Settings',
  selectModel: 'Select Model'
};

describe('ChatHeader', () => {
  const defaultProps = {
    selectedModel: 'gpt-4',
    availableModels: AVAILABLE_MODELS,
    onModelChange: jest.fn(),
    commonText: mockCommonText
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ChatHeader {...defaultProps} />);
    
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('Vibe Coding')).toBeInTheDocument();
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
  });

  it('opens model dropdown when clicked', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const modelButton = screen.getByText('GPT-4');
    fireEvent.click(modelButton);
    
    expect(screen.getByText('Most capable model for complex tasks')).toBeInTheDocument();
    expect(screen.getByText('Fast and efficient for most tasks')).toBeInTheDocument();
  });

  it('calls onModelChange when a model is selected', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const modelButton = screen.getByText('GPT-4');
    fireEvent.click(modelButton);
    
    const gpt35Option = screen.getByText('GPT-3.5 Turbo');
    fireEvent.click(gpt35Option);
    
    expect(defaultProps.onModelChange).toHaveBeenCalledWith('gpt-3.5-turbo');
  });

  it('shows unavailable models as disabled', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const modelButton = screen.getByText('GPT-4');
    fireEvent.click(modelButton);
    
    const claudeOption = screen.getByText('Claude 3');
    expect(claudeOption).toBeDisabled();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<ChatHeader {...defaultProps} />);
    
    const modelButton = screen.getByText('GPT-4');
    fireEvent.click(modelButton);
    
    expect(screen.getByText('Most capable model for complex tasks')).toBeInTheDocument();
    
    // Click outside
    fireEvent.click(document.body);
    
    expect(screen.queryByText('Most capable model for complex tasks')).not.toBeInTheDocument();
  });

  it('persists model selection to localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    render(<ChatHeader {...defaultProps} />);
    
    const modelButton = screen.getByText('GPT-4');
    fireEvent.click(modelButton);
    
    const gpt35Option = screen.getByText('GPT-3.5 Turbo');
    fireEvent.click(gpt35Option);
    
    expect(setItemSpy).toHaveBeenCalledWith('selectedModel', 'gpt-3.5-turbo');
    
    setItemSpy.mockRestore();
  });
});