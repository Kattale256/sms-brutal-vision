
import React from 'react';
import { Transaction } from '../../services/SmsReader';
import TransactionSummary from './TransactionSummary';
import TransactionBreakdown from './TransactionBreakdown';
import RecipientsPieChart from './RecipientsPieChart';
import FeesOverTime from './FeesOverTime';
import ExportButtons from './ExportButtons';
import TaxesChart from './TaxesChart';
import CashFlowStatement from './CashFlowStatement';

interface TransactionStatsProps {
  transactions: Transaction[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-between items-center">
        <CashFlowStatement transactions={transactions} />
        <ExportButtons transactions={transactions} />
      </div>
      
      {/* Transaction Summary Section */}
      <TransactionSummary transactions={transactions} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionBreakdown transactions={transactions} />
        <RecipientsPieChart transactions={transactions} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeesOverTime transactions={transactions} />
        <TaxesChart transactions={transactions} />
      </div>
    </div>
  );
};

export default TransactionStats;
