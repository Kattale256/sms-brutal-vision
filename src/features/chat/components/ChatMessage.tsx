
import React from 'react';
import { ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`${
          isUser
            ? 'ml-auto bg-yellow-400 border-neo-black'
            : 'mr-auto bg-white border-neo-black'
        } p-3 rounded-lg border-2 max-w-[80%]`}
      >
        <div className="text-sm">{message.content}</div>
        <div className="text-right mt-1 text-[10px] text-gray-500">
          {message.timestamp instanceof Date
            ? message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
