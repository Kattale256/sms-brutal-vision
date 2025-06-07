
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
  
  // Find current quarter in data or use the most recent
  React.useEffect(() => {
    if (!selectedQuarter && quarters.length > 0) {
      // Try to find current quarter
      const current = quarters.find(q => 
        q.quarter === currentQuarter.quarter && q.financialYear === currentQuarter.financialYear
      );
      
      // Otherwise use most recent quarter (last in sorted array)
      if (current) {
        onQuarterChange(current);
      } else {
        onQuarterChange(quarters[quarters.length - 1]);
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
  
  return (
    <div className="mb-6">
      <Tabs 
        value={currentTabValue}
        onValueChange={(value) => {
          if (value === 'all') {
            onQuarterChange(null);
          } else {
            const [quarter, fyYear] = value.split('-');
            const quarterInfo = quarters.find(q => 
              q.quarter === parseInt(quarter) && q.financialYear === fyYear
            );
            if (quarterInfo) {
              onQuarterChange(quarterInfo);
            }
          }
        }}
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
              {quarters.map((quarter) => (
                <TabsTrigger 
                  key={getTabValue(quarter)} 
                  value={getTabValue(quarter)}
                  className={`whitespace-nowrap px-3 py-2 text-sm lg:text-base ${
                    quarter.quarter === currentQuarter.quarter && 
                    quarter.financialYear === currentQuarter.financialYear ? 
                    'border-2 border-neo-yellow' : ''
                  }`}
                >
                  {quarter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      </Tabs>
      
      <div className="bg-yellow-50 p-3 border-l-4 border-yellow-500">
        <p className="text-sm text-yellow-800">
          <strong>Uganda's Financial Year:</strong> July 1st to June 30th<br/>
          <strong>Q1:</strong> Jul-Sep | <strong>Q2:</strong> Oct-Dec | <strong>Q3:</strong> Jan-Mar | <strong>Q4:</strong> Apr-Jun
        </p>
      </div>
    </div>
  );
};

export default QuarterSelector;
