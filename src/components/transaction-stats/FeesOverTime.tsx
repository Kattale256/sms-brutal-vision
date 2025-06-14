
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
      day: 'numeric'
    }),
    fullDate: date,
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
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 300}>
        <BarChart 
          data={feesChartData} 
          margin={{ 
            top: isMobile ? 10 : 20, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? 5 : 20, 
            bottom: isMobile ? 60 : 20 
          }}
        >
          <XAxis 
            dataKey="date" 
            stroke="#1A1F2C" 
            tick={{ fontSize: isMobile ? 9 : 12 }}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 80 : 60}
            interval={isMobile ? Math.max(0, Math.floor(feesChartData.length / 4)) : 0}
            axisLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
            tickLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
          />
          <YAxis 
            stroke="#1A1F2C" 
            tick={{ fontSize: isMobile ? 9 : 12 }}
            width={isMobile ? 35 : 60}
            tickFormatter={(value) => isMobile ? `${Math.round(value)}` : value.toLocaleString()}
            axisLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
            tickLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #1A1F2C',
              borderRadius: '4px',
              fontSize: isMobile ? '11px' : '14px',
              padding: isMobile ? '6px' : '8px'
            }}
            itemStyle={{ color: '#1A1F2C', fontSize: isMobile ? '11px' : '14px' }}
            labelStyle={{ color: '#1A1F2C', fontWeight: 'bold', fontSize: isMobile ? '11px' : '14px' }}
            formatter={(value) => [`${value} ${mainCurrency}`, 'Fees']}
            labelFormatter={(label, payload) => {
              if (payload && payload[0] && payload[0].payload) {
                return new Date(payload[0].payload.fullDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              }
              return label;
            }}
          />
          <Bar dataKey="fees" fill="#FFC107" stroke="#1A1F2C" strokeWidth={isMobile ? 1 : 2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeesOverTime;
