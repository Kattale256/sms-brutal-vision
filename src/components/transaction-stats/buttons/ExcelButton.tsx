
import React from 'react';
import { Button } from '../../ui/button';
import { FileDown } from 'lucide-react';
import { Transaction } from '../../../services/SmsReader';
import { exportToExcel } from '../export-utils';

interface ExcelButtonProps {
  transactions: Transaction[];
}

const ExcelButton: React.FC<ExcelButtonProps> = ({ transactions }) => {
  const handleClick = () => {
    exportToExcel(transactions);
  };

  return (
    <Button onClick={handleClick} variant="outline" className="gap-2">
      <FileDown className="h-4 w-4" />
      Export to Excel
    </Button>
  );
};

export default ExcelButton;
