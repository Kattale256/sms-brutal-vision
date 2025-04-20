
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../services/SmsReader';
import { getBalanceHistory, getTransactionsByDate } from '../utils/transactionAnalyzer';
import { Calendar } from './ui/calendar';

interface TransactionTimelineProps {
  transactions: Transaction[];
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactions }) => {
  const balanceHistory = getBalanceHistory(transactions);
  const transactionsByDate = getTransactionsByDate(transactions);
  
  // Format data for the charts
  const balanceData = Object.entries(balanceHistory).map(([date, balance]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    balance
  }));
  
  const activityData = Object.entries(transactionsByDate).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count
  }));

  // Get the most frequent currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';

  // Get transaction dates and amounts for calendar highlighting
  const transactionDates = transactions.map(t => new Date(t.timestamp));
  
  // Find start and end dates
  let startDate = new Date();
  let endDate = new Date();
  
  if (transactionDates.length > 0) {
    startDate = new Date(Math.min(...transactionDates.map(d => d.getTime())));
    endDate = new Date(Math.max(...transactionDates.map(d => d.getTime())));
  }

  // Create a map of transaction amounts by date
  const transactionAmountsByDate: Record<string, number> = {};
  transactions.forEach(t => {
    const dateStr = new Date(t.timestamp).toISOString().split('T')[0];
    if (!transactionAmountsByDate[dateStr]) {
      transactionAmountsByDate[dateStr] = 0;
    }
    transactionAmountsByDate[dateStr] += Math.abs(t.amount);
  });

  // Find the max transaction amount for normalization
  const maxAmount = Object.values(transactionAmountsByDate).length > 0 
    ? Math.max(...Object.values(transactionAmountsByDate))
    : 1;

  // Custom day rendering function
  const renderDay = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    const amount = transactionAmountsByDate[dateStr] || 0;
    const intensity = (amount / maxAmount) * 100;
    
    // Only style days with transactions
    if (amount > 0) {
      return (
        <div
          style={{
            backgroundColor: `rgba(255, 82, 82, ${intensity / 100})`,
            color: intensity > 50 ? 'white' : undefined,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%'
          }}
        >
          {day.getDate()}
        </div>
      );
    }
    
    return day.getDate();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {balanceData.length > 0 && (
        <div className="neo-chart">
          <h2 className="text-2xl font-bold mb-4">BALANCE HISTORY</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                formatter={(value) => [`${value} ${mainCurrency}`, 'Balance']}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#1A1F2C" 
                strokeWidth={3}
                dot={{ stroke: '#1A1F2C', strokeWidth: 2, fill: '#4CAF50', r: 5 }}
                activeDot={{ stroke: '#1A1F2C', strokeWidth: 2, fill: '#FFD600', r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="neo-chart">
        <h2 className="text-2xl font-bold mb-4">TRANSACTION ACTIVITY</h2>
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
              formatter={(value) => [value, 'Transactions']}
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

      <div className="neo-chart md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">ANALYZED PERIOD CALENDAR</h2>
        <div className="flex flex-col items-center">
          <p className="text-sm mb-2">Transaction period: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</p>
          <p className="text-xs mb-4">Color intensity indicates transaction volume</p>
          <Calendar 
            className="pointer-events-auto border-2 border-neo-black p-4 bg-white"
            mode="range"
            defaultMonth={startDate}
            selected={{
              from: startDate,
              to: endDate
            }}
            disabled={{ before: startDate, after: endDate }}
            components={{
              Day: ({ day, ...props }) => (
                <div {...props}>
                  {renderDay(day)}
                </div>
              )
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionTimeline;
