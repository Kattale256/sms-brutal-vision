
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card } from '../ui/card';
import { FileChartPie, FileChartLine, TrendingUp, Calendar, HelpCircle } from 'lucide-react';

interface FAQCategory {
  category: string;
  icon: React.ReactNode;
  label: string;
  questions: string[];
}

interface ChatFAQTabsProps {
  onQuestionClick: (question: string) => void;
}

const ChatFAQTabs: React.FC<ChatFAQTabsProps> = ({ onQuestionClick }) => {
  const FAQs: FAQCategory[] = [
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
  
  return (
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
                onClick={() => onQuestionClick(question)}
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
  );
};

export default ChatFAQTabs;
