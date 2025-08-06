'use client'
import React, { memo } from 'react';
import { Message } from '~/types/chat';

interface UserMessageProps {
  message: Message;
}

const UserMessage: React.FC<UserMessageProps> = memo(({ message }) => {
  return (
    <div className="flex justify-end mb-4 chat-message-user">
      <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]">
        <div className="bg-[#ffa11b] text-white rounded-2xl rounded-br-md px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
          <div className="whitespace-pre-wrap break-words text-sm sm:text-base">
            {message.content}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
});

UserMessage.displayName = 'UserMessage';

export default UserMessage;