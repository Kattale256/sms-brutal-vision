
import React from 'react';
import { Transaction } from '../../services/SmsReader';
import { getTotalsByType, getTotalFees, getTotalIncome, getTotalTaxes } from '../../utils/transactionAnalyzer';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions }) => {
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  const totalIncome = getTotalIncome(transactions);
  
  // Get most common currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  return (
    <div className="neo-card">
      <h2 className="text-2xl font-bold mb-4">TRANSACTION SUMMARY</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border-2 border-neo-black bg-neo-yellow">
          <div className="text-sm font-medium">AMOUNT SENT</div>
          <div className="text-2xl font-bold mt-1">{totalsByType.send.toFixed(2)} {mainCurrency}</div>
        </div>
        <div className="p-4 border-2 border-neo-black bg-neo-yellow">
          <div className="text-sm font-medium">AMOUNT RECEIVED</div>
          <div className="text-2xl font-bold mt-1">{totalIncome.toFixed(2)} {mainCurrency}</div>
        </div>
        <div className="p-4 border-2 border-neo-black bg-neo-yellow">
          <div className="text-sm font-medium">FEES PAID</div>
          <div className="text-2xl font-bold mt-1">{totalFees.toFixed(2)} {mainCurrency}</div>
        </div>
        <div className="p-4 border-2 border-neo-black bg-neo-yellow">
          <div className="text-sm font-medium">TAXES PAID</div>
          <div className="text-2xl font-bold mt-1">{totalTaxes.toFixed(2)} {mainCurrency}</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
