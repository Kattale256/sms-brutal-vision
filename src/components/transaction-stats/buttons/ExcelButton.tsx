
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
}

const ExcelButton: React.FC<ExcelButtonProps> = ({ transactions, onClick, selectedQuarter }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Direct export without payment flow (for testing)
      ExcelButton.exportToExcel(transactions, selectedQuarter);
    }
  };

  return (
    <Button onClick={handleClick} variant="outline" className="gap-2">
      <FileDown className="h-4 w-4" />
      Export to Excel
    </Button>
  );
};

// Static method to allow calling from payment handler
ExcelButton.exportToExcel = (transactions: Transaction[], selectedQuarter?: QuarterInfo | null) => {
  exportToExcel(transactions, selectedQuarter);
};

export default ExcelButton;
