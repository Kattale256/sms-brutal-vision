
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
  
  // Calculate interval for better spacing
  const getXAxisInterval = () => {
    if (feesChartData.length <= 5) return 0;
    if (feesChartData.length <= 10) return 1;
    if (isMobile) {
      return Math.max(1, Math.floor(feesChartData.length / 3));
    }
    return Math.max(0, Math.floor(feesChartData.length / 8));
  };
  
  return (
    <div className="neo-chart">
      <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">FEES OVER TIME</h2>
      <ResponsiveContainer width="100%" height={isMobile ? 320 : 350}>
        <BarChart 
          data={feesChartData} 
          margin={{ 
            top: isMobile ? 15 : 20, 
            right: isMobile ? 15 : 30, 
            left: isMobile ? 10 : 20, 
            bottom: isMobile ? 80 : 60 
          }}
        >
          <XAxis 
            dataKey="date" 
            stroke="#1A1F2C" 
            tick={{ 
              fontSize: isMobile ? 10 : 12,
              fill: '#1A1F2C'
            }}
            angle={-45}
            textAnchor="end"
            height={isMobile ? 100 : 80}
            interval={getXAxisInterval()}
            axisLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
            tickLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
            tickMargin={isMobile ? 8 : 10}
          />
          <YAxis 
            stroke="#1A1F2C" 
            tick={{ 
              fontSize: isMobile ? 10 : 12,
              fill: '#1A1F2C'
            }}
            width={isMobile ? 40 : 60}
            tickFormatter={(value) => {
              if (isMobile) {
                return value >= 1000 ? `${(value/1000).toFixed(0)}k` : Math.round(value).toString();
              }
              return value.toLocaleString();
            }}
            axisLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
            tickLine={{ stroke: '#1A1F2C', strokeWidth: 1 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #1A1F2C',
              borderRadius: '4px',
              fontSize: isMobile ? '12px' : '14px',
              padding: isMobile ? '8px' : '10px'
            }}
            itemStyle={{ color: '#1A1F2C', fontSize: isMobile ? '12px' : '14px' }}
            labelStyle={{ color: '#1A1F2C', fontWeight: 'bold', fontSize: isMobile ? '12px' : '14px' }}
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
          <Bar 
            dataKey="fees" 
            fill="#FFC107" 
            stroke="#1A1F2C" 
            strokeWidth={isMobile ? 1 : 2}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeesOverTime;
