
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '../services/SmsReader';
import { getTotalsByType, getTotalFees, getAverageTransactionAmount } from '../utils/transactionAnalyzer';

interface TransactionStatsProps {
  transactions: Transaction[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const averageAmounts = getAverageTransactionAmount(transactions);
  
  // Format data for the chart
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  const chartData = Object.entries(totalsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, amount]) => ({
      name: typeLabels[type as keyof typeof typeLabels],
      amount: amount
    }));
  
  // Calculate total in/out
  const totalIn = totalsByType.receive + totalsByType.deposit;
  const totalOut = totalsByType.send + totalsByType.payment + totalsByType.withdrawal;
  const balance = totalIn - totalOut;
  
  // Get most common currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="neo-chart">
        <h2 className="text-2xl font-bold mb-4">TRANSACTION SUMMARY</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#1A1F2C" />
            <YAxis stroke="#1A1F2C" />
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
            <Bar dataKey="amount" fill="#FF5252" stroke="#1A1F2C" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="neo-chart">
        <h2 className="text-2xl font-bold mb-4">FINANCIAL OVERVIEW</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-neo-black p-4">
            <h3 className="text-lg font-bold">MONEY IN</h3>
            <p className="text-2xl font-bold text-green-600">{totalIn.toFixed(2)} {mainCurrency}</p>
          </div>
          <div className="border-2 border-neo-black p-4">
            <h3 className="text-lg font-bold">MONEY OUT</h3>
            <p className="text-2xl font-bold text-red-600">{totalOut.toFixed(2)} {mainCurrency}</p>
          </div>
          <div className="border-2 border-neo-black p-4">
            <h3 className="text-lg font-bold">FEES PAID</h3>
            <p className="text-2xl font-bold text-neo-gray">{totalFees.toFixed(2)} {mainCurrency}</p>
          </div>
          <div className="border-2 border-neo-black p-4">
            <h3 className="text-lg font-bold">BALANCE</h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.toFixed(2)} {mainCurrency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;
