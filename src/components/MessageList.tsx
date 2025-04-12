
import React, { useState } from 'react';
import { SmsMessage } from '../data/sampleData';
import { categorizeMessage } from '../utils/smsAnalyzer';

interface MessageListProps {
  messages: SmsMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const [filter, setFilter] = useState<string>('');
  
  const filteredMessages = messages.filter(msg => {
    if (!filter) return true;
    const category = msg.category || categorizeMessage(msg);
    return category.toLowerCase().includes(filter.toLowerCase()) ||
           msg.content.toLowerCase().includes(filter.toLowerCase()) ||
           msg.sender.toLowerCase().includes(filter.toLowerCase());
  });

  const getCategoryColor = (category: string): string => {
    const categories: Record<string, string> = {
      shopping: 'bg-blue-500',
      finance: 'bg-green-500',
      security: 'bg-red-500',
      personal: 'bg-purple-500',
      travel: 'bg-yellow-500',
      health: 'bg-pink-500',
      transportation: 'bg-indigo-500',
      bills: 'bg-orange-500',
      marketing: 'bg-teal-500',
      work: 'bg-cyan-500'
    };
    
    return categories[category] || 'bg-gray-500';
  };

  return (
    <div className="neo-card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">RECENT MESSAGES</h2>
        <div className="relative">
          <input 
            type="text"
            placeholder="Filter messages..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="neo-input"
          />
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredMessages.map((message) => {
            const category = message.category || categorizeMessage(message);
            const date = new Date(message.timestamp).toLocaleString();
            
            return (
              <div key={message.id} className="border-2 border-neo-black p-4 mb-4 bg-neo-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">{message.sender}</div>
                  <div className="flex items-center">
                    <div className={`px-3 py-1 border-2 border-neo-black ${getCategoryColor(category)}`}>
                      {category.toUpperCase()}
                    </div>
                  </div>
                </div>
                <p className="mb-2">{message.content}</p>
                <div className="text-sm text-neo-gray">{date}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageList;
