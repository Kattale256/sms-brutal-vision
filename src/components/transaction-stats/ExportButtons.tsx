
import React from 'react';
import { Transaction } from '../../services/SmsReader';
import { ExcelButton, PDFButton } from './buttons';

interface ExportButtonsProps {
  transactions: Transaction[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ transactions }) => {
  return (
    <div className="flex justify-end gap-2">
      <ExcelButton transactions={transactions} />
      <PDFButton transactions={transactions} />
    </div>
  );
};

export default ExportButtons;
