
import React, { useState } from 'react';
import { ChatFAQTabsProps } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

const ChatFAQTabs: React.FC<ChatFAQTabsProps> = ({ onQuestionClick }) => {
  const [activeTab, setActiveTab] = useState("basic");

  const faqCategories = {
    basic: [
      "What is my total income?",
      "Show me my transaction breakdown",
      "How much have I spent on fees?"
    ],
    insights: [
      "What are my spending patterns?",
      "Show my transactions from last week",
      "Who are my most frequent contacts?"
    ],
    reports: [
      "Compare this month to last month",
      "What was my largest transaction?",
      "How many transactions do I have?"
    ]
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full bg-gray-100 border-2 border-neo-black">
        <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
        <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
        <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
      </TabsList>
      
      {Object.entries(faqCategories).map(([key, questions]) => (
        <TabsContent key={key} value={key} className="mt-2">
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => onQuestionClick(q)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ChatFAQTabs;
