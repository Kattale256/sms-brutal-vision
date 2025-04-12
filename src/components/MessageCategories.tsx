
import React from 'react';
import { SmsMessage } from '../data/sampleData';
import { categorizeMessage, getSenderStats, extractKeywords } from '../utils/smsAnalyzer';

interface MessageCategoriesProps {
  messages: SmsMessage[];
}

const MessageCategories: React.FC<MessageCategoriesProps> = ({ messages }) => {
  const senderStats = getSenderStats(messages);
  const keywords = extractKeywords(messages);

  const messagesWithCategories = messages.map(msg => ({
    ...msg,
    category: msg.category || categorizeMessage(msg)
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="neo-card">
        <h2 className="text-2xl font-bold mb-4">TOP SENDERS</h2>
        <div className="space-y-2">
          {Object.entries(senderStats).map(([sender, count], index) => (
            <div key={sender} className="flex justify-between items-center border-b-2 border-neo-black pb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-none bg-neo-yellow border-2 border-neo-black flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <span className="font-medium">{sender}</span>
              </div>
              <div className="text-xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="neo-card">
        <h2 className="text-2xl font-bold mb-4">TOP KEYWORDS</h2>
        <div className="flex flex-wrap">
          {Object.entries(keywords).map(([keyword, count]) => (
            <div 
              key={keyword}
              className="m-1 px-3 py-1 border-2 border-neo-black bg-neo-white"
              style={{ 
                fontSize: `${Math.max(14, Math.min(24, 14 + count * 2))}px`,
              }}
            >
              {keyword.toUpperCase()}
              <span className="ml-1 font-bold text-neo-red">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageCategories;
