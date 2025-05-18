
import React from 'react';

export interface ChatMessageType {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`mb-4 ${
        message.role === 'user' ? 'ml-auto mr-2 text-right' : 'ml-2 mr-auto'
      }`}
    >
      <div
        className={`inline-block p-3 rounded-lg max-w-[80%] ${
          message.role === 'user'
            ? 'bg-neo-yellow border-2 border-neo-black transform transition-all hover:scale-[1.01]'
            : 'bg-gray-100 border-2 border-neo-black transform transition-all hover:scale-[1.01]'
        }`}
      >
        <p className="whitespace-pre-line">{message.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {message.timestamp instanceof Date 
            ? message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
          }
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
