
import React, { useState, useRef, useEffect } from 'react';
import { Transaction } from '../services/sms/types';
import { analyzeTransactionQuery, generateMessageId } from '../utils/transactionChat';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SendIcon, MessageCircle, Trash, Calendar, Download, TrendingUp, FileChartLine, InfoCircle, FileChartPie, HelpCircle } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Handle } from './ui/dnd-handle';
import { toast } from './ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Card } from './ui/card';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface TransactionChatProps {
  transactions: Transaction[];
}

const STORAGE_KEY = 'transaction-chat-history';

const FAQs = [
  {
    category: 'summary',
    icon: <FileChartPie className="h-4 w-4" />,
    label: 'Summary',
    questions: [
      "What's my total transaction amount?",
      "Give me a breakdown by transaction type",
      "How many transactions do I have?",
      "What's my average transaction amount?"
    ]
  },
  {
    category: 'fees',
    icon: <FileChartLine className="h-4 w-4" />,
    label: 'Fees & Taxes',
    questions: [
      "How much have I spent on fees?",
      "What's my total tax paid?",
      "Show me fees over time",
      "What percentage of my transactions are fees?"
    ]
  },
  {
    category: 'patterns',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Patterns',
    questions: [
      "What are my spending patterns?",
      "Who do I transact with most often?",
      "What days do I spend the most?",
      "Compare this month to last month"
    ]
  },
  {
    category: 'dates',
    icon: <Calendar className="h-4 w-4" />,
    label: 'Time-Based',
    questions: [
      "Show transactions from last week",
      "What was my largest transaction this month?",
      "How has my spending changed over time?",
      "What day of the week do I spend most?"
    ]
  }
];

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
        .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
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

  return (
    <div ref={setNodeRef} style={style} className="neo-card relative flex flex-col h-[600px]">
      <div className="absolute top-2 right-2 cursor-move" {...attributes} {...listeners}>
        <Handle />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          TRANSACTION ASSISTANT
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={exportChatHistory} 
            title="Export chat"
            className="h-8 w-8"
          >
            <Download className="h-4 w-4" />
          </Button>
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
                  ? 'bg-neo-yellow border-2 border-neo-black transform transition-all hover:scale-[1.01]'
                  : 'bg-gray-100 border-2 border-neo-black transform transition-all hover:scale-[1.01]'
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

      <div className="mb-4">
        <Tabs defaultValue="summary" className="w-full border-2 border-neo-black p-2 bg-white">
          <TabsList className="grid grid-cols-4 gap-2 bg-gray-100 p-1">
            {FAQs.map((faq) => (
              <TabsTrigger
                key={faq.category}
                value={faq.category}
                className="flex items-center gap-1 data-[state=active]:bg-neo-yellow data-[state=active]:border-neo-black data-[state=active]:border-2"
              >
                {faq.icon}
                <span className="hidden sm:inline">{faq.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {FAQs.map((faq) => (
            <TabsContent key={faq.category} value={faq.category} className="mt-2 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {faq.questions.map((question, idx) => (
                  <Card 
                    key={idx}
                    className="p-3 cursor-pointer border-2 hover:bg-gray-50 transform transition-all hover:scale-[1.02] border-neo-black"
                    onClick={() => handleFAQClick(question)}
                  >
                    <div className="flex items-center gap-1">
                      <HelpCircle className="h-4 w-4 text-neo-gray" />
                      <p className="text-sm font-medium">{question}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
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
