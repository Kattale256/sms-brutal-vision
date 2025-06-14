
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
  
  // Filter transactions based on selected quarter with better handling
  const filteredTransactions = React.useMemo(() => {
    if (!selectedQuarter) {
      console.log('=== All Time Selected - No Filtering ===');
      console.log('Showing all transactions:', transactions.length);
      return transactions;
    }
    
    console.log('=== Quarter Filtering ===');
    console.log(`Filtering for Q${selectedQuarter.quarter} ${selectedQuarter.financialYear}`);
    
    const filtered = filterTransactionsByQuarter(
      transactions, 
      selectedQuarter.quarter, 
      selectedQuarter.financialYear
    );
    
    console.log(`Filtered result: ${filtered.length} transactions`);
    return filtered;
  }, [transactions, selectedQuarter]);

  // Enhanced debug logging
  useEffect(() => {
    console.log('=== TransactionStats State Update ===');
    console.log('Selected quarter:', selectedQuarter);
    console.log('Total transactions:', transactions.length);
    console.log('Filtered transactions:', filteredTransactions.length);
    
    if (selectedQuarter) {
      console.log(`Currently showing: Q${selectedQuarter.quarter} ${selectedQuarter.financialYear}`);
      // Validate the filtering
      validateQuarterData(transactions, selectedQuarter.quarter, selectedQuarter.financialYear);
    } else {
      console.log('Currently showing: All Time (no filtering)');
    }
  }, [selectedQuarter, transactions, filteredTransactions]);

  // Handle quarter change with improved state management
  const handleQuarterChange = (quarter: QuarterInfo | null) => {
    console.log('=== Quarter Change Handler ===');
    console.log('Previous quarter:', selectedQuarter);
    console.log('New quarter:', quarter);
    
    setSelectedQuarter(quarter);
    
    // Force a re-render by logging the change
    setTimeout(() => {
      console.log('Quarter change completed. Current state:', quarter);
    }, 100);
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
