
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getTotalsByType, getTotalFees, getTotalTaxes } from '../../utils/transactionAnalyzer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Maximize2 } from 'lucide-react';

interface TransactionBreakdownProps {
  transactions: Transaction[];
}

const TransactionBreakdown: React.FC<TransactionBreakdownProps> = ({ transactions }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use only the filtered transactions passed as props
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  
  // Enhanced color mapping with more distinct colors
  const typeColors = {
    send: '#FF6B35', // Bright orange
    receive: '#10B981', // Emerald green
    payment: '#3B82F6', // Blue
    withdrawal: '#8B5CF6', // Purple
    deposit: '#F59E0B', // Amber
    other: '#6B7280', // Gray
    fees: '#EC4899', // Pink
    taxes: '#EF4444' // Red
  };
  
  // Group transactions by date (daily granularity for better quarter visibility)
  const transactionsByDate: Record<string, Record<string, number>> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    if (!transactionsByDate[dateKey]) {
      transactionsByDate[dateKey] = {
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
    if (transaction.type in transactionsByDate[dateKey]) {
      transactionsByDate[dateKey][transaction.type] += Math.abs(transaction.amount);
    } else {
      transactionsByDate[dateKey].other += Math.abs(transaction.amount);
    }
    
    // Add fees and taxes
    if (transaction.fee) {
      transactionsByDate[dateKey].fees += transaction.fee;
    }
    if (transaction.tax) {
      transactionsByDate[dateKey].taxes += transaction.tax;
    }
  });
  
  // Convert to chart data format and sort by date
  const chartData = Object.entries(transactionsByDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, values]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
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

  const ChartComponent = ({ height = 400, showFullscreenButton = true }) => (
    <div className="relative">
      {showFullscreenButton && (
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 z-10 p-2 bg-white border-2 border-neo-black rounded hover:bg-gray-50 md:hidden"
          title="Expand chart"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={chartData} 
          margin={{ 
            top: 20, 
            right: 30, 
            left: isFullscreen ? 60 : 40, 
            bottom: isFullscreen ? 60 : 80 
          }}
        >
          <XAxis 
            dataKey="date" 
            stroke="#1A1F2C" 
            tick={{ fontSize: isFullscreen ? 12 : 10 }}
            angle={isFullscreen ? 0 : -45}
            textAnchor={isFullscreen ? "middle" : "end"}
            height={isFullscreen ? 40 : 80}
            interval={isFullscreen ? "preserveStartEnd" : Math.max(0, Math.floor(chartData.length / 8))}
          />
          <YAxis 
            stroke="#1A1F2C" 
            tick={{ fontSize: isFullscreen ? 12 : 10 }}
            width={isFullscreen ? 80 : 60}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #1A1F2C',
              borderRadius: '0px',
              fontSize: isFullscreen ? '14px' : '12px'
            }}
            itemStyle={{ color: '#1A1F2C' }}
            labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
            formatter={(value) => [`${value} ${mainCurrency}`, '']}
            labelFormatter={(label, payload) => {
              if (payload && payload[0] && payload[0].payload) {
                return new Date(payload[0].payload.fullDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              }
              return `Date: ${label}`;
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            fontSize={isFullscreen ? 14 : 12}
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
  
  return (
    <>
      <div className="neo-chart">
        <h2 className="text-2xl font-bold mb-4">TRANSACTION BREAKDOWN</h2>
        <ChartComponent />
      </div>
      
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-6">
          <DialogHeader>
            <DialogTitle>Transaction Breakdown - Expanded View</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ChartComponent height={500} showFullscreenButton={false} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionBreakdown;
