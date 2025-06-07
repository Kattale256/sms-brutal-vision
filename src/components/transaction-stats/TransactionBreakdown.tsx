
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getTotalsByType } from '../../utils/transactionAnalyzer';

interface TransactionBreakdownProps {
  transactions: Transaction[];
}

const TransactionBreakdown: React.FC<TransactionBreakdownProps> = ({ transactions }) => {
  const totalsByType = getTotalsByType(transactions);
  
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };

  // Color mapping to match TransactionSummary
  const typeColors = {
    send: '#f97316', // orange
    receive: '#10b981', // emerald
    payment: '#3b82f6', // blue
    withdrawal: '#8b5cf6', // purple
    deposit: '#f59e0b', // amber
    other: '#6b7280' // gray
  };
  
  const chartData = Object.entries(totalsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, amount]) => ({
      name: typeLabels[type as keyof typeof typeLabels],
      amount: amount,
      fill: typeColors[type as keyof typeof typeColors]
    }));
  
  // Get most common currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">TRANSACTION BREAKDOWN</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
          <XAxis 
            dataKey="name" 
            stroke="#1A1F2C" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#1A1F2C" 
            tick={{ fontSize: 12 }}
            width={60}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #1A1F2C',
              borderRadius: '0px'
            }}
            itemStyle={{ color: '#1A1F2C' }}
            labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
            formatter={(value) => [`${value} ${mainCurrency}`, 'Amount']}
          />
          <Bar 
            dataKey="amount" 
            stroke="#1A1F2C" 
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionBreakdown;
