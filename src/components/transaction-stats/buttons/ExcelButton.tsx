
import React from 'react';
import { Button } from '../../ui/button';
import { FileDown } from 'lucide-react';
import { Transaction } from '../../../services/SmsReader';
import { exportToExcel } from '../export-utils';
import { QuarterInfo } from '../../../utils/quarterUtils';

interface ExcelButtonProps {
  transactions: Transaction[];
  onClick?: () => void;
  selectedQuarter?: QuarterInfo | null;
  className?: string;
}

// Create a standalone export function that can be called from anywhere
export const handleExportToExcel = (transactions: Transaction[], selectedQuarter?: QuarterInfo | null) => {
  exportToExcel(transactions, selectedQuarter);
};

const ExcelButton: React.FC<ExcelButtonProps> = ({ transactions, onClick, selectedQuarter, className }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Direct export without payment flow (for testing)
      handleExportToExcel(transactions, selectedQuarter);
    }
  };

  return (
    <Button onClick={handleClick} variant="outline" className={`gap-2 ${className || ''}`}>
      <FileDown className="h-4 w-4" />
      Export Excel Report
    </Button>
  );
};

export default ExcelButton;
