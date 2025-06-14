
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getFeesByDate } from '../../utils/transactionAnalyzer';
import { useIsMobile } from '../../hooks/use-mobile';

interface FeesOverTimeProps {
  transactions: Transaction[];
}

const FeesOverTime: React.FC<FeesOverTimeProps> = ({ transactions }) => {
  const isMobile = useIsMobile();
  const feesByDate = getFeesByDate(transactions);
  
  const feesChartData = Object.entries(feesByDate).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: isMobile ? 'numeric' : 'numeric'
    }),
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
      <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">FEES OVER TIME</h2>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <BarChart 
          data={feesChartData} 
          margin={{ 
            top: isMobile ? 10 : 20, 
            right: isMobile ? 15 : 30, 
            left: isMobile ? 0 : 0, 
            bottom: isMobile ? 40 : 5 
          }}
        >
          <XAxis 
            dataKey="date" 
            stroke="#1A1F2C" 
            tick={{ fontSize: isMobile ? 10 : 12 }}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
            interval={isMobile ? "preserveStartEnd" : 0}
          />
          <YAxis 
            stroke="#1A1F2C" 
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 40 : 60}
            tickFormatter={(value) => isMobile ? `${value}` : value.toLocaleString()}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #1A1F2C',
              borderRadius: '0px',
              fontSize: isMobile ? '12px' : '14px'
            }}
            itemStyle={{ color: '#1A1F2C' }}
            labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
            formatter={(value) => [`${value} ${mainCurrency}`, 'Fees']}
          />
          <Bar dataKey="fees" fill="#FFC107" stroke="#1A1F2C" strokeWidth={isMobile ? 1 : 2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeesOverTime;
