
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
import { separateTransactionsByDate } from '../../utils/transactionDateUtils';

interface TransactionStatsProps {
  transactions: Transaction[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterInfo | null>(null);
  const [showUndatedFilter, setShowUndatedFilter] = useState<'dated' | 'undated' | 'all'>('dated');
  
  // Separate transactions by date validity
  const { datedTransactions, undatedTransactions } = React.useMemo(() => {
    return separateTransactionsByDate(transactions);
  }, [transactions]);

  // Get transactions based on filter selection
  const baseTransactions = React.useMemo(() => {
    switch (showUndatedFilter) {
      case 'undated':
        return undatedTransactions;
      case 'all':
        return transactions;
      default:
        return datedTransactions;
    }
  }, [datedTransactions, undatedTransactions, transactions, showUndatedFilter]);
  
  // Filter transactions based on selected quarter (only for dated transactions)
  const filteredTransactions = React.useMemo(() => {
    if (showUndatedFilter === 'undated') {
      // For undated transactions, don't apply quarter filtering
      console.log('=== Showing Undated Transactions ===');
      console.log('Undated transactions count:', undatedTransactions.length);
      return undatedTransactions;
    }
    
    if (!selectedQuarter) {
      console.log('=== All Time Selected - No Filtering ===');
      console.log('Showing all dated transactions:', baseTransactions.length);
      return baseTransactions;
    }
    
    console.log('=== Quarter Filtering ===');
    console.log(`Filtering for Q${selectedQuarter.quarter} ${selectedQuarter.financialYear}`);
    
    const filtered = filterTransactionsByQuarter(
      baseTransactions, 
      selectedQuarter.quarter, 
      selectedQuarter.financialYear
    );
    
    console.log(`Filtered result: ${filtered.length} transactions`);
    return filtered;
  }, [baseTransactions, selectedQuarter, showUndatedFilter, undatedTransactions]);

  // Enhanced debug logging
  useEffect(() => {
    console.log('=== TransactionStats State Update ===');
    console.log('Selected quarter:', selectedQuarter);
    console.log('Show undated filter:', showUndatedFilter);
    console.log('Total transactions:', transactions.length);
    console.log('Dated transactions:', datedTransactions.length);
    console.log('Undated transactions:', undatedTransactions.length);
    console.log('Filtered transactions:', filteredTransactions.length);
    
    if (selectedQuarter && showUndatedFilter === 'dated') {
      console.log(`Currently showing: Q${selectedQuarter.quarter} ${selectedQuarter.financialYear}`);
      validateQuarterData(datedTransactions, selectedQuarter.quarter, selectedQuarter.financialYear);
    } else if (showUndatedFilter === 'undated') {
      console.log('Currently showing: Undated transactions only');
    } else {
      console.log('Currently showing: All Time (no filtering)');
    }
  }, [selectedQuarter, transactions, filteredTransactions, showUndatedFilter, datedTransactions, undatedTransactions]);

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
          {/* Date Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`px-3 py-2 border-2 border-neo-black font-bold ${
                showUndatedFilter === 'dated' ? 'bg-neo-yellow' : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setShowUndatedFilter('dated')}
            >
              DATED TRANSACTIONS ({datedTransactions.length})
            </button>
            {undatedTransactions.length > 0 && (
              <button
                className={`px-3 py-2 border-2 border-neo-black font-bold ${
                  showUndatedFilter === 'undated' ? 'bg-red-400 text-white' : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setShowUndatedFilter('undated')}
              >
                UNDATED MESSAGES ({undatedTransactions.length})
              </button>
            )}
            <button
              className={`px-3 py-2 border-2 border-neo-black font-bold ${
                showUndatedFilter === 'all' ? 'bg-blue-400 text-white' : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setShowUndatedFilter('all')}
            >
              ALL TRANSACTIONS ({transactions.length})
            </button>
          </div>
        </div>
        <ExportButtons 
          transactions={filteredTransactions} 
          selectedQuarter={selectedQuarter}
        />
      </div>
      
      {/* Only show quarter selector for dated transactions */}
      {showUndatedFilter !== 'undated' && (
        <QuarterSelector 
          transactions={datedTransactions}
          selectedQuarter={selectedQuarter}
          onQuarterChange={handleQuarterChange}
        />
      )}
      
      {/* Show warning for undated transactions */}
      {showUndatedFilter === 'undated' && (
        <div className="p-4 border-2 border-red-500 bg-red-50 rounded-lg">
          <h3 className="font-bold text-red-700 mb-2">⚠️ UNDATED TRANSACTIONS</h3>
          <p className="text-red-600">
            These transactions do not have valid date/time information and are excluded from quarterly reports. 
            They may be from corrupted SMS messages or have invalid timestamps.
          </p>
        </div>
      )}
      
      {/* Transaction Summary Section */}
      <TransactionSummary 
        transactions={filteredTransactions} 
        selectedQuarter={showUndatedFilter === 'undated' ? null : selectedQuarter} 
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
