
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getFeesByDate } from '../../utils/transactionAnalyzer';

interface FeesOverTimeProps {
  transactions: Transaction[];
}

const FeesOverTime: React.FC<FeesOverTimeProps> = ({ transactions }) => {
  const feesByDate = getFeesByDate(transactions);
  
  const feesChartData = Object.entries(feesByDate).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fees: amount
  }));
  
  // Get most common currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">FEES OVER TIME</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={feesChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
            formatter={(value) => [`${value} ${mainCurrency}`, 'Fees']}
          />
          <Bar dataKey="fees" fill="#FFC107" stroke="#1A1F2C" strokeWidth={2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeesOverTime;
