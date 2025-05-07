
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../services/SmsReader';
import { getTransactionsByDate } from '../utils/transactionAnalyzer';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Handle } from './ui/dnd-handle';

interface TransactionTimelineProps {
  transactions: Transaction[];
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactions }) => {
  // Display only transactions per day
  const transactionsByDate = getTransactionsByDate(transactions);

  const activityData = Object.entries(transactionsByDate).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count
  }));

  // Get the most frequent currency for display (if desired in tooltip)
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: "transaction-timeline" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="neo-chart relative">
      <div className="absolute top-2 right-2 cursor-move" {...attributes} {...listeners}>
        <Handle />
      </div>
      <h2 className="text-2xl font-bold mb-4">TRANSACTION ACTIVITY OVER TIME</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={activityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="date" stroke="#1A1F2C" />
          <YAxis stroke="#1A1F2C" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #1A1F2C',
              borderRadius: '0px'
            }}
            itemStyle={{ color: '#1A1F2C' }}
            labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
            formatter={(value) => [`${value}`, 'Transactions']}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#1A1F2C"
            strokeWidth={3}
            dot={{ stroke: '#1A1F2C', strokeWidth: 2, fill: '#FF5252', r: 5 }}
            activeDot={{ stroke: '#1A1F2C', strokeWidth: 2, fill: '#FFD600', r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionTimeline;
