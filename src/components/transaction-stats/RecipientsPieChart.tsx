
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getFrequentContacts } from '../../utils/transactionAnalyzer';

interface RecipientsPieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const RecipientsPieChart: React.FC<RecipientsPieChartProps> = ({ transactions }) => {
  const frequentContacts = getFrequentContacts(transactions);
  
  const recipientsPieData = Object.entries(frequentContacts)
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name || 'Unknown',
      value: count
    }));
    
  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">RECIPIENTS PIE CHART</h2>
      {recipientsPieData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={recipientsPieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#36A2EB"
              dataKey="value"
            >
              {recipientsPieData.map((entry, index) => (
                <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1A1F2C" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} transactions`, 'Frequency']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #1A1F2C',
                borderRadius: '0px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span style={{ color: '#1A1F2C', fontWeight: 'bold' }}>
                  {value.length > 20 ? `${value.substring(0, 20)}...` : value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-neo-gray">
          No recipient data available
        </div>
      )}
    </div>
  );
};

export default RecipientsPieChart;
