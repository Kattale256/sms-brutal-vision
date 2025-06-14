
import React, { useState, useEffect } from 'react';
import { Transaction } from '../../services/SmsReader';
import TransactionSummary from './TransactionSummary';
import TransactionBreakdown from './TransactionBreakdown';
import RecipientsPieChart from './RecipientsPieChart';
import FeesOverTime from './FeesOverTime';
import ExportButtons from './ExportButtons';
import TaxesChart from './TaxesChart';
import QuarterSelector from './QuarterSelector';
import { QuarterInfo } from '../../utils/quarterUtils';
import { filterTransactionsByQuarter, validateQuarterData } from '../../utils/quarterUtils';

interface TransactionStatsProps {
  transactions: Transaction[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterInfo | null>(null);
  
  // Filter transactions based on selected quarter
  const filteredTransactions = selectedQuarter 
    ? filterTransactionsByQuarter(
        transactions, 
        selectedQuarter.quarter, 
        selectedQuarter.financialYear
      )
    : transactions;

  // Enhanced debug logging with validation
  useEffect(() => {
    console.log('=== TransactionStats Debug ===');
    console.log('Selected quarter:', selectedQuarter);
    console.log('Total transactions:', transactions.length);
    console.log('Filtered transactions:', filteredTransactions.length);
    
    if (selectedQuarter) {
      console.log(`Showing Q${selectedQuarter.quarter} ${selectedQuarter.financialYear}`);
      // Use validation function for better debugging
      validateQuarterData(transactions, selectedQuarter.quarter, selectedQuarter.financialYear);
    } else {
      console.log('Showing All Time - no filtering applied');
    }
    
    // Log sample transaction dates for verification
    console.log('Sample transaction dates:', transactions.slice(0, 5).map(t => ({
      timestamp: t.timestamp,
      date: new Date(t.timestamp).toISOString(),
      amount: t.amount
    })));
    
    console.log('Sample filtered transaction dates:', filteredTransactions.slice(0, 5).map(t => ({
      timestamp: t.timestamp,
      date: new Date(t.timestamp).toISOString(),
      amount: t.amount
    })));
  }, [selectedQuarter, transactions, filteredTransactions]);

  // Handle quarter change with additional logging
  const handleQuarterChange = (quarter: QuarterInfo | null) => {
    console.log('Quarter change requested:', quarter);
    setSelectedQuarter(quarter);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {/* Removed CashFlowStatement as it's now integrated in ExportButtons */}
        </div>
        <ExportButtons 
          transactions={filteredTransactions} 
          selectedQuarter={selectedQuarter}
        />
      </div>
      
      <QuarterSelector 
        transactions={transactions}
        selectedQuarter={selectedQuarter}
        onQuarterChange={handleQuarterChange}
      />
      
      {/* Transaction Summary Section */}
      <TransactionSummary 
        transactions={filteredTransactions} 
        selectedQuarter={selectedQuarter} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionBreakdown 
          transactions={filteredTransactions} 
        />
        <RecipientsPieChart 
          transactions={filteredTransactions} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeesOverTime 
          transactions={filteredTransactions} 
        />
        <TaxesChart 
          transactions={filteredTransactions} 
        />
      </div>
    </div>
  );
};

export default TransactionStats;
