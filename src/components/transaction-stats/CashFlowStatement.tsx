
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { FileDown } from 'lucide-react';
import { Transaction } from '../../services/SmsReader';
import { exportCashFlowToPDF } from './export-utils/exportCashFlow';
import { exportFreeCashFlowToPDF } from './export-utils/exportFreeCashFlowToPDF';
import { QuarterInfo } from '../../utils/quarterUtils';
import { PaymentProduct, EXPORT_PRODUCTS } from '../../services/MoMoService';
import PaymentDialog from '../payment/PaymentDialog';
import ExportOptions from './buttons/ExportOptions';

interface CashFlowStatementProps {
  transactions: Transaction[];
  selectedQuarter?: QuarterInfo | null;
}

const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ transactions, selectedQuarter }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  
  const handleExportClick = () => {
    setOptionsDialogOpen(true);
  };
  
  const handleFreeExport = () => {
    exportFreeCashFlowToPDF(transactions, selectedQuarter);
    setOptionsDialogOpen(false);
  };
  
  const handlePremiumExport = () => {
    exportCashFlowToPDF(transactions, selectedQuarter);
    setOptionsDialogOpen(false);
  };

  return (
    <>
      <Button onClick={handleExportClick} variant="outline" className="gap-2">
        <FileDown className="h-4 w-4" />
        Export Cash Flow Statement
      </Button>
      
      <ExportOptions 
        isOpen={optionsDialogOpen}
        onClose={() => setOptionsDialogOpen(false)}
        exportType="cashflow"
        transactions={transactions}
        selectedQuarter={selectedQuarter}
        onFreeExport={handleFreeExport}
        onPremiumExport={handlePremiumExport}
      />
    </>
  );
};

export default CashFlowStatement;
