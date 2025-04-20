
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SmsMessage } from '../data/sampleData';
import { getMessagesByCategory, extractFinancialData } from '../utils/smsAnalyzer';
import VisitorStats from './VisitorStats';

interface MessageStatsProps {
  messages: SmsMessage[];
}

const MessageStats: React.FC<MessageStatsProps> = ({ messages }) => {
  const categories = getMessagesByCategory(messages);
  const financialData = extractFinancialData(messages);

  const categoryData = Object.entries(categories).map(([name, count]) => ({
    name,
    count
  }));

  const financeData = [
    {
      name: 'Income',
      amount: financialData
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0)
    },
    {
      name: 'Expenses',
      amount: Math.abs(
        financialData
          .filter(item => item.type === 'expense')
          .reduce((sum, item) => sum + item.amount, 0)
      )
    }
  ];

  // Get export count from localStorage or default to 0
  const exportCount = parseInt(localStorage.getItem('exportCount') || '0', 10);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neo-chart">
          <h2 className="text-2xl font-bold mb-4">MESSAGE CATEGORIES</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#1A1F2C" />
              <YAxis stroke="#1A1F2C" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid #1A1F2C',
                  borderRadius: '0px'
                }}
                itemStyle={{ color: '#1A1F2C' }}
                labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" fill="#FF5252" stroke="#1A1F2C" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="neo-chart">
          <h2 className="text-2xl font-bold mb-4">FINANCIAL ANALYSIS</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#1A1F2C" />
              <YAxis stroke="#1A1F2C" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid #1A1F2C',
                  borderRadius: '0px'
                }}
                itemStyle={{ color: '#1A1F2C' }}
                labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
              />
              <Bar dataKey="amount" fill="#FFD600" stroke="#1A1F2C" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Add visitor stats */}
      <VisitorStats exportCount={exportCount} />
    </div>
  );
};

export default MessageStats;
