
import React from 'react';
import ChatMessage, { ChatMessageType } from './ChatMessage';
import ChatLoadingIndicator from './ChatLoadingIndicator';

interface ChatMessagesContainerProps {
  messages: ChatMessageType[];
  isProcessing: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessagesContainer: React.FC<ChatMessagesContainerProps> = ({
  messages,
  isProcessing,
  chatEndRef
}) => {
  return (
    <div className="flex-1 overflow-y-auto mb-4 border-2 border-neo-black p-4 bg-white rounded-md">
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isProcessing && <ChatLoadingIndicator />}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessagesContainer;
