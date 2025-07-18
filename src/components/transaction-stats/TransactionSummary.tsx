
import React from 'react';
import { Transaction } from '../../services/SmsReader';
import { getTotalsByType, getTotalFees, getTotalIncome, getTotalTaxes } from '../../utils/transactionAnalyzer';
import { QuarterInfo } from '../../utils/quarterUtils';

interface TransactionSummaryProps {
  transactions: Transaction[];
  selectedQuarter?: QuarterInfo | null;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  transactions,
  selectedQuarter
}) => {
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
      <h2 className="text-2xl font-bold mb-4">
        TRANSACTION SUMMARY
        {selectedQuarter && (
          <span className="ml-2 text-lg font-normal">({selectedQuarter.label})</span>
        )}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="p-3 border-2 border-neo-black bg-gradient-to-br from-orange-400 to-orange-500 text-white">
          <div className="text-xs font-medium mb-1 overflow-hidden">AMOUNT SENT</div>
          <div className="text-lg font-bold leading-tight break-words">
            {Math.round(totalsByType.send)} {mainCurrency}
          </div>
        </div>
        
        <div className="p-3 border-2 border-neo-black bg-gradient-to-br from-emerald-400 to-emerald-500 text-white">
          <div className="text-xs font-medium mb-1 overflow-hidden">AMOUNT RECEIVED</div>
          <div className="text-lg font-bold leading-tight break-words">
            {Math.round(totalIncome)} {mainCurrency}
          </div>
        </div>
        
        <div className="p-3 border-2 border-neo-black bg-gradient-to-br from-blue-400 to-blue-500 text-white">
          <div className="text-xs font-medium mb-1 overflow-hidden">PAYMENTS MADE</div>
          <div className="text-lg font-bold leading-tight break-words">
            {Math.round(totalsByType.payment)} {mainCurrency}
          </div>
        </div>
        
        <div className="p-3 border-2 border-neo-black bg-gradient-to-br from-purple-400 to-purple-500 text-white">
          <div className="text-xs font-medium mb-1 overflow-hidden">WITHDRAWALS</div>
          <div className="text-lg font-bold leading-tight break-words">
            {Math.round(totalsByType.withdrawal)} {mainCurrency}
          </div>
        </div>
        
        <div className="p-3 border-2 border-neo-black bg-gradient-to-br from-amber-400 to-amber-500 text-white">
          <div className="text-xs font-medium mb-1 overflow-hidden">FEES PAID</div>
          <div className="text-lg font-bold leading-tight break-words">
            {Math.round(totalFees)} {mainCurrency}
          </div>
        </div>
        
        <div className="p-3 border-2 border-neo-black bg-gradient-to-br from-red-400 to-red-500 text-white">
          <div className="text-xs font-medium mb-1 overflow-hidden">TAXES PAID</div>
          <div className="text-lg font-bold leading-tight break-words">
            {Math.round(totalTaxes)} {mainCurrency}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
