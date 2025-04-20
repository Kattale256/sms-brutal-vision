
import React from 'react';
import { Transaction } from '../services/SmsReader';

interface TransactionTimelineProps {
  transactions: Transaction[];
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactions }) => {
  // Implementation of transaction timeline
  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">TIMELINE OF TRANSACTION ACTIVITY</h2>
      <div className="p-4">
        {/* Timeline content will go here */}
        <p>Timeline showing {transactions.length} transactions</p>
      </div>
    </div>
  );
};

export default TransactionTimeline;
