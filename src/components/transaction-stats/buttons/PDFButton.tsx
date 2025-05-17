
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
}

const PDFButton: React.FC<PDFButtonProps> = ({ transactions, onClick, selectedQuarter }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Direct export without payment flow (for testing)
      PDFButton.exportToPDF(transactions, selectedQuarter);
    }
  };

  return (
    <Button onClick={handleClick} variant="outline" className="gap-2">
      <FileDown className="h-4 w-4" />
      Export to PDF
    </Button>
  );
};

// Static method to allow calling from payment handler
PDFButton.exportToPDF = (transactions: Transaction[], selectedQuarter?: QuarterInfo | null) => {
  exportToPDF(transactions, selectedQuarter);
};

export default PDFButton;
