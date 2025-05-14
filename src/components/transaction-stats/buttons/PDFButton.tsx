
import React from 'react';
import { Button } from '../../ui/button';
import { FileDown } from 'lucide-react';
import { Transaction } from '../../../services/SmsReader';
import { exportToPDF } from '../export-utils';

interface PDFButtonProps {
  transactions: Transaction[];
}

const PDFButton: React.FC<PDFButtonProps> = ({ transactions }) => {
  const handleClick = () => {
    exportToPDF(transactions);
  };

  return (
    <Button onClick={handleClick} variant="outline" className="gap-2">
      <FileDown className="h-4 w-4" />
      Export to PDF
    </Button>
  );
};

export default PDFButton;
