
import React, { useState } from 'react';
import { Transaction } from '../../services/SmsReader';
import { ExcelButton, PDFButton } from './buttons';
import { handleExportToExcel, handleExportToPDF } from './buttons';
import { exportFreeToExcel } from './export-utils/exportFreeToExcel';
import { exportFreeToPDF } from './export-utils/exportFreeToPDF';
import { QuarterInfo } from '../../utils/quarterUtils';
import PaymentDialog from '../payment/PaymentDialog';
import ExportOptions from './buttons/ExportOptions';
import { PaymentProduct, EXPORT_PRODUCTS } from '../../services/MoMoService';

interface ExportButtonsProps {
  transactions: Transaction[];
  selectedQuarter?: QuarterInfo | null;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ transactions, selectedQuarter }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PaymentProduct | null>(null);
  const [pendingExportType, setPendingExportType] = useState<'excel' | 'pdf' | null>(null);
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  
  const handleExportClick = (exportType: 'excel' | 'pdf') => {
    setPendingExportType(exportType);
    setOptionsDialogOpen(true);
  };
  
  const handleFreePdfExport = () => {
    exportFreeToPDF(transactions, selectedQuarter);
    setOptionsDialogOpen(false);
  };
  
  const handleFreeExcelExport = () => {
    exportFreeToExcel(transactions, selectedQuarter);
    setOptionsDialogOpen(false);
  };
  
  const handlePremiumExport = () => {
    if (pendingExportType === 'excel') {
      handleExportToExcel(transactions, selectedQuarter);
    } else if (pendingExportType === 'pdf') {
      handleExportToPDF(transactions, selectedQuarter);
    }
    setOptionsDialogOpen(false);
  };
  
  return (
    <div className="flex justify-end gap-2">
      <ExcelButton 
        onClick={() => handleExportClick('excel')} 
        transactions={transactions}
        selectedQuarter={selectedQuarter}
      />
      <PDFButton 
        onClick={() => handleExportClick('pdf')} 
        transactions={transactions}
        selectedQuarter={selectedQuarter}
      />
      
      <ExportOptions 
        isOpen={optionsDialogOpen}
        onClose={() => setOptionsDialogOpen(false)}
        exportType={pendingExportType || 'pdf'}
        transactions={transactions}
        selectedQuarter={selectedQuarter}
        onFreeExport={pendingExportType === 'excel' ? handleFreeExcelExport : handleFreePdfExport}
        onPremiumExport={handlePremiumExport}
      />
    </div>
  );
};

export default ExportButtons;
