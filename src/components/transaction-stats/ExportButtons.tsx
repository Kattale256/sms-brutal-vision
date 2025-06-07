
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
    <div className="flex flex-col justify-end gap-3 w-full">
      <div className="flex flex-col gap-3 w-full">
        <div className="w-full">
          <ExcelButton 
            onClick={() => handleExportClick('excel')} 
            transactions={transactions}
            selectedQuarter={selectedQuarter}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-2 border-orange-700 shadow-lg font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-xl"
          />
        </div>
        <div className="w-full">
          <PDFButton 
            onClick={() => handleExportClick('pdf')} 
            transactions={transactions}
            selectedQuarter={selectedQuarter}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-700 shadow-lg font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-xl"
          />
        </div>
      </div>
      
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
