
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getTotalsByType, getTotalFees, getTotalTaxes } from '../../utils/transactionAnalyzer';

interface TransactionBreakdownProps {
  transactions: Transaction[];
}

const TransactionBreakdown: React.FC<TransactionBreakdownProps> = ({ transactions }) => {
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  
  // Color mapping to match TransactionSummary
  const typeColors = {
    send: '#f97316', // orange
    receive: '#10b981', // emerald
    payment: '#3b82f6', // blue
    withdrawal: '#8b5cf6', // purple
    deposit: '#f59e0b', // amber
    other: '#6b7280', // gray
    fees: '#f59e0b', // amber
    taxes: '#ef4444' // red
  };
  
  // Group transactions by month for area chart
  const transactionsByMonth: Record<string, Record<string, number>> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!transactionsByMonth[monthKey]) {
      transactionsByMonth[monthKey] = {
        send: 0,
        receive: 0,
        payment: 0,
        withdrawal: 0,
        deposit: 0,
        other: 0,
        fees: 0,
        taxes: 0
      };
    }
    
    // Add transaction amount to appropriate category
    if (transaction.type in transactionsByMonth[monthKey]) {
      transactionsByMonth[monthKey][transaction.type] += Math.abs(transaction.amount);
    } else {
      transactionsByMonth[monthKey].other += Math.abs(transaction.amount);
    }
    
    // Add fees and taxes
    if (transaction.fee) {
      transactionsByMonth[monthKey].fees += transaction.fee;
    }
    if (transaction.tax) {
      transactionsByMonth[monthKey].taxes += transaction.tax;
    }
  });
  
  // Convert to chart data format
  const chartData = Object.entries(transactionsByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, values]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      ...values
    }));
  
  // Get most common currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  // Define the areas to show (only those with data)
  const areasToShow = Object.keys(typeColors).filter(type => {
    return chartData.some(data => data[type] > 0);
  });
  
  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">TRANSACTION BREAKDOWN</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 80 }}>
          <XAxis 
            dataKey="month" 
            stroke="#1A1F2C" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            stroke="#1A1F2C" 
            tick={{ fontSize: 12 }}
            width={80}
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
            formatter={(value) => [`${value} ${mainCurrency}`, '']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          {areasToShow.map((type) => (
            <Area
              key={type}
              type="monotone"
              dataKey={type}
              stackId="1"
              stroke={typeColors[type as keyof typeof typeColors]}
              fill={typeColors[type as keyof typeof typeColors]}
              fillOpacity={0.7}
              strokeWidth={2}
              name={type.charAt(0).toUpperCase() + type.slice(1)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionBreakdown;
