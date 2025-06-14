import React from 'react';
import { Transaction } from '../../services/SmsReader';
import { getAllQuartersInData, getCurrentQuarter, QuarterInfo } from '../../utils/quarterUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface QuarterSelectorProps {
  transactions: Transaction[];
  selectedQuarter: QuarterInfo | null;
  onQuarterChange: (quarter: QuarterInfo | null) => void;
  showAllOption?: boolean;
}

const QuarterSelector: React.FC<QuarterSelectorProps> = ({
  transactions,
  selectedQuarter,
  onQuarterChange,
  showAllOption = true
}) => {
  const quarters = getAllQuartersInData(transactions);
  const currentQuarter = getCurrentQuarter();
  
  // Enhanced initialization logic
  React.useEffect(() => {
    if (!selectedQuarter && quarters.length > 0) {
      console.log('Initializing quarter selection...');
      console.log('Available quarters:', quarters.map(q => q.label));
      console.log('Current quarter:', currentQuarter.label);
      
      // Try to find current quarter
      const current = quarters.find(q => 
        q.quarter === currentQuarter.quarter && q.financialYear === currentQuarter.financialYear
      );
      
      if (current) {
        console.log('Setting to current quarter:', current.label);
        onQuarterChange(current);
      } else {
        // Otherwise use most recent quarter (last in sorted array)
        const mostRecent = quarters[quarters.length - 1];
        console.log('Setting to most recent quarter:', mostRecent.label);
        onQuarterChange(mostRecent);
      }
    }
  }, [selectedQuarter, quarters, currentQuarter, onQuarterChange]);
  
  if (quarters.length === 0) {
    return <div className="text-center text-gray-500">No quarter data available</div>;
  }

  const getTabValue = (quarter: QuarterInfo | null) => {
    return quarter ? `${quarter.quarter}-${quarter.financialYear}` : 'all';
  };
  
  const currentTabValue = getTabValue(selectedQuarter);
  
  const handleTabChange = (value: string) => {
    console.log('=== Tab Change Handler ===');
    console.log('Tab change requested:', value);
    console.log('Current tab value:', currentTabValue);
    
    if (value === 'all') {
      console.log('Setting quarter to null (All Time)');
      onQuarterChange(null);
    } else {
      const [quarterStr, fyYear] = value.split('-');
      const quarterNum = parseInt(quarterStr);
      
      console.log('Parsing quarter:', { quarterStr, fyYear, quarterNum });
      
      const quarterInfo = quarters.find(q => 
        q.quarter === quarterNum && q.financialYear === fyYear
      );
      
      console.log('Found quarter info:', quarterInfo);
      
      if (quarterInfo) {
        console.log('Setting quarter to:', quarterInfo.label);
        onQuarterChange(quarterInfo);
      } else {
        console.error('Quarter not found for value:', value);
      }
    }
  };
  
  return (
    <div className="mb-6">
      <Tabs 
        value={currentTabValue}
        onValueChange={handleTabChange}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
          <h3 className="text-lg font-bold">Financial Quarter</h3>
          <div className="overflow-x-auto">
            <TabsList className="flex flex-nowrap min-w-full lg:min-w-0 w-max lg:w-auto">
              {showAllOption && (
                <TabsTrigger 
                  value="all"
                  className="whitespace-nowrap px-3 py-2 text-sm lg:text-base"
                >
                  All Time
                </TabsTrigger>
              )}
              {quarters.map((quarter) => {
                const tabValue = getTabValue(quarter);
                const isCurrent = quarter.quarter === currentQuarter.quarter && 
                                 quarter.financialYear === currentQuarter.financialYear;
                
                return (
                  <TabsTrigger 
                    key={tabValue} 
                    value={tabValue}
                    className={`whitespace-nowrap px-3 py-2 text-sm lg:text-base ${
                      isCurrent ? 'border-2 border-neo-yellow' : ''
                    }`}
                  >
                    {quarter.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>
      </Tabs>
      
      <div className="bg-yellow-50 p-3 border-l-4 border-yellow-500">
        <p className="text-sm text-yellow-800">
          <strong>Uganda's Financial Year:</strong> July 1st to June 30th<br/>
          <strong>Q1:</strong> Jul-Sep | <strong>Q2:</strong> Oct-Dec | <strong>Q3:</strong> Jan-Mar | <strong>Q4:</strong> Apr-Jun
        </p>
        {selectedQuarter && (
          <p className="text-xs text-yellow-700 mt-1">
            Currently showing: <strong>{selectedQuarter.label}</strong>
          </p>
        )}
        {!selectedQuarter && (
          <p className="text-xs text-yellow-700 mt-1">
            Currently showing: <strong>All Time</strong> (no filtering applied)
          </p>
        )}
      </div>
    </div>
  );
};

export default QuarterSelector;
