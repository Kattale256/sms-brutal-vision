
import React from 'react';
import { Button } from '../ui/button';
import { FileDown } from 'lucide-react';
import { Transaction } from '../../services/SmsReader';
import { exportCashFlowToPDF } from './export-utils/exportCashFlow';
import { 
  getTotalsByType,
  getTotalFees,
  getTotalTaxes,
  getTotalIncome
} from '../../utils/transactionAnalyzer';

interface CashFlowStatementProps {
  transactions: Transaction[];
}

const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ transactions }) => {
  const handleDownload = () => {
    exportCashFlowToPDF(transactions);
  };

  // Calculate cash flow metrics - moved to function to prevent calculations in render
  const getFlowMetrics = () => {
    const totalsByType = getTotalsByType(transactions);
    const totalIncome = getTotalIncome(transactions);
    const totalExpenses = totalsByType.send + totalsByType.payment + totalsByType.withdrawal;
    const totalFees = getTotalFees(transactions);
    const totalTaxes = getTotalTaxes(transactions);
    const netCashFlow = totalIncome - totalExpenses - totalFees - totalTaxes;

    // Get most common currency
    const currencyMap: Record<string, number> = {};
    transactions.forEach(t => {
      currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
    });
    const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';

    return { totalIncome, totalExpenses, totalFees, totalTaxes, netCashFlow, mainCurrency };
  };

  return (
    <Button onClick={handleDownload} variant="outline" className="gap-2">
      <FileDown className="h-4 w-4" />
      Export Cash Flow Statement
    </Button>
  );
};

export default CashFlowStatement;
