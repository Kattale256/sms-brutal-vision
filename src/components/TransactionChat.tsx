
import React from 'react';
import { Transaction } from '../services/sms/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Handle } from './ui/dnd-handle';
import { useTransactionChat } from '../hooks/useTransactionChat';

// Import refactored components
import ChatFAQTabs from './chat/ChatFAQTabs';
import ChatInput from './chat/ChatInput';
import ChatHeader from './chat/ChatHeader';
import ChatMessagesContainer from './chat/ChatMessagesContainer';

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
  } = useSortable({
    id: "transaction-chat"
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className="neo-card relative flex flex-col h-[560px] sm:h-[630px]">
      <div className="absolute top-2 right-2 cursor-move" {...attributes} {...listeners}>
        <Handle />
      </div>
      
      <ChatHeader onExport={exportChatHistory} onClear={clearChat} />
      
      <ChatMessagesContainer 
        messages={messages}
        isProcessing={isProcessing}
        chatEndRef={chatEndRef}
      />

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
