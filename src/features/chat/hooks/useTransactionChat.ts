
import { useState, useRef, useEffect } from 'react';
import { Transaction } from '../../../services/sms/types';
import { ChatMessageType } from '../types';
import { generateMessageId } from '../types';
import { analyzeTransactionQuery } from '../utils/transactionAnalysis';
import { toast } from '../../../components/ui/use-toast';

export const STORAGE_KEY = 'transaction-chat-history';

export const useTransactionChat = (transactions: Transaction[]) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  
  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
      }
    } else if (messages.length === 0) {
      // Add welcome message if no history exists
      const welcomeMessage = {
        id: generateMessageId(),
        content: "Hi! I can help you analyze your transaction data. Try asking questions like 'What's my total income?' or use the FAQ tabs below.",
        role: 'assistant' as const,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessageType = {
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
        const assistantMessage: ChatMessageType = {
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
      const errorMessage: ChatMessageType = {
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

  const handleFAQClick = (question: string) => {
    setInput(question);
    
    // Add small delay for better UX so user can see the question appear in the input
    setTimeout(() => {
      // Create a synthetic form event
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      
      handleSubmit(syntheticEvent);
    }, 100);
  };
  
  const clearChat = () => {
    const welcomeMessage = {
      id: generateMessageId(),
      content: "Chat cleared. How else can I help analyze your transactions?",
      role: 'assistant' as const,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
  };

  const exportChatHistory = () => {
    try {
      // Format chat history
      const chatContent = messages
        .map(msg => `[${msg.timestamp instanceof Date ? msg.timestamp.toLocaleString() : new Date(msg.timestamp).toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      
      // Create blob and download link
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction-chat-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Chat Exported",
        description: "Your chat history has been downloaded.",
      });
    } catch (error) {
      console.error('Error exporting chat history:', error);
      toast({
        title: "Export Failed",
        description: "Could not export chat history.",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    input,
    setInput,
    isProcessing,
    chatEndRef,
    handleSubmit,
    handleFAQClick,
    clearChat,
    exportChatHistory
  };
};
