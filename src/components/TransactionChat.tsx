
import React, { useState, useRef, useEffect } from 'react';
import { Transaction } from '../services/sms/types';
import { analyzeTransactionQuery, generateMessageId } from '../utils/transactionChat';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SendIcon, MessageCircle, Trash } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Handle } from './ui/dnd-handle';
import { toast } from './ui/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface TransactionChatProps {
  transactions: Transaction[];
}

const TransactionChat: React.FC<TransactionChatProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
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

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Add a welcome message when the component is mounted
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: generateMessageId(),
          content: "Hi! I can help you analyze your transaction data. Try asking questions like 'What's my total income?' or 'How much have I spent on fees?'",
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Process the query with our analysis function
      const response = analyzeTransactionQuery(input, transactions);
      
      // Add assistant response
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        setIsProcessing(false);
      }, 500); // Small delay to simulate processing
    } catch (error) {
      console.error('Error processing question:', error);
      
      // Handle error
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        content: "Sorry, I encountered an error analyzing your transactions. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setIsProcessing(false);
      
      toast({
        title: "Analysis Error",
        description: "Could not analyze your transaction data.",
        variant: "destructive",
      });
    }
  };
  
  const clearChat = () => {
    setMessages([
      {
        id: generateMessageId(),
        content: "Chat cleared. How else can I help analyze your transactions?",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div ref={setNodeRef} style={style} className="neo-card relative flex flex-col h-[500px]">
      <div className="absolute top-2 right-2 cursor-move" {...attributes} {...listeners}>
        <Handle />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          TRANSACTION ASSISTANT
        </h2>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={clearChat} 
          title="Clear chat"
          className="h-8 w-8"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 border-2 border-neo-black p-4 bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${
              msg.role === 'user' ? 'ml-auto mr-2 text-right' : 'ml-2 mr-auto'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-neo-yellow border-2 border-neo-black'
                  : 'bg-gray-100 border-2 border-neo-black'
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
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
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask questions about your transactions..."
          className="flex-1 resize-none border-2 border-neo-black h-20"
          disabled={isProcessing}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button 
          type="submit" 
          disabled={isProcessing} 
          className="bg-neo-yellow hover:bg-yellow-400 text-neo-black border-2 border-neo-black h-20"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default TransactionChat;
