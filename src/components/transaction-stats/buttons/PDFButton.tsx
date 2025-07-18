
import React from 'react';
import { Button } from '../../ui/button';
import { FileDown } from 'lucide-react';
import { Transaction } from '../../../services/SmsReader';
import { exportToPDF } from '../export-utils';
import { QuarterInfo } from '../../../utils/quarterUtils';

interface PDFButtonProps {
  transactions: Transaction[];
  onClick?: () => void;
  selectedQuarter?: QuarterInfo | null;
  className?: string;
}

// Create a standalone export function that can be called from anywhere
export const handleExportToPDF = (transactions: Transaction[], selectedQuarter?: QuarterInfo | null) => {
  exportToPDF(transactions, selectedQuarter);
};

const PDFButton: React.FC<PDFButtonProps> = ({ transactions, onClick, selectedQuarter, className }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Direct export without payment flow (for testing)
      handleExportToPDF(transactions, selectedQuarter);
    }
  };

  return (
    <Button onClick={handleClick} variant="outline" className={`gap-2 ${className || ''}`}>
      <FileDown className="h-4 w-4" />
      Download PDF Report
    </Button>
  );
};

export default PDFButton;
