
import React from 'react';
import { Transaction } from '../services/sms/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Handle } from './ui/dnd-handle';

// Import refactored components from new structure
import ChatMessage from '../features/chat/components/ChatMessage';
import ChatFAQTabs from '../features/chat/components/ChatFAQTabs';
import ChatInput from '../features/chat/components/ChatInput';
import ChatHeader from '../features/chat/components/ChatHeader';
import { useTransactionChat } from '../features/chat/hooks/useTransactionChat';

interface TransactionChatProps {
  transactions: Transaction[];
}

const TransactionChat: React.FC<TransactionChatProps> = ({ transactions }) => {
  const {
    messages,
    input,
    setInput,
    isProcessing,
    chatEndRef,
    handleSubmit,
    handleFAQClick,
    clearChat,
    exportChatHistory
  } = useTransactionChat(transactions);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: "transaction-chat" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="neo-card relative flex flex-col h-[600px]">
      <div className="absolute top-2 right-2 cursor-move" {...attributes} {...listeners}>
        <Handle />
      </div>
      
      <ChatHeader onExport={exportChatHistory} onClear={clearChat} />
      
      <div className="flex-1 overflow-y-auto mb-4 border-2 border-neo-black p-4 bg-white">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isProcessing && (
          <div className="ml-2 mr-auto mb-4">
            <div className="inline-block p-3 rounded-lg bg-gray-100 border-2 border-neo-black">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mb-4">
        <ChatFAQTabs onQuestionClick={handleFAQClick} />
      </div>
      
      <ChatInput 
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default TransactionChat;
