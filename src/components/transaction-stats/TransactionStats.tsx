
import React from 'react';
import { Transaction } from '../../services/SmsReader';
import TransactionSummary from './TransactionSummary';
import TransactionBreakdown from './TransactionBreakdown';
import RecipientsPieChart from './RecipientsPieChart';
import FeesOverTime from './FeesOverTime';
import ExportButtons from './ExportButtons';

interface TransactionStatsProps {
  transactions: Transaction[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <ExportButtons transactions={transactions} />
      
      {/* Transaction Summary Section */}
      <TransactionSummary transactions={transactions} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionBreakdown transactions={transactions} />
        <RecipientsPieChart transactions={transactions} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeesOverTime transactions={transactions} />
      </div>
    </div>
  );
};

export default TransactionStats;
