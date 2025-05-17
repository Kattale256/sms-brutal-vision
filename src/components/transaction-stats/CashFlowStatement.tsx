
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { FileDown } from 'lucide-react';
import { Transaction } from '../../services/SmsReader';
import { exportCashFlowToPDF } from './export-utils/exportCashFlow';
import { QuarterInfo } from '../../utils/quarterUtils';
import { PaymentProduct, EXPORT_PRODUCTS } from '../../services/MoMoService';
import PaymentDialog from '../payment/PaymentDialog';

interface CashFlowStatementProps {
  transactions: Transaction[];
  selectedQuarter?: QuarterInfo | null;
}

const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ transactions, selectedQuarter }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  // Determine which product to use based on quarter selection
  const getProductId = () => {
    if (selectedQuarter) {
      // Check if current quarter
      const isCurrentQuarter = true; // In a real app, compare with current date
      return `cashflow-${isCurrentQuarter ? 'current-quarter' : 'full-year'}`;
    } else {
      // Full year product
      return 'cashflow-full-year';
    }
  };
  
  const handleExportClick = () => {
    const productId = getProductId();
    const product = EXPORT_PRODUCTS[productId];
    
    if (product) {
      setPaymentDialogOpen(true);
    }
  };
  
  const handlePaymentComplete = () => {
    // Execute the export after payment
    exportCashFlowToPDF(transactions, selectedQuarter);
  };

  return (
    <>
      <Button onClick={handleExportClick} variant="outline" className="gap-2">
        <FileDown className="h-4 w-4" />
        Export Cash Flow Statement
      </Button>
      
      {paymentDialogOpen && (
        <PaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          onPaymentComplete={handlePaymentComplete}
          product={EXPORT_PRODUCTS[getProductId()]}
        />
      )}
    </>
  );
};

export default CashFlowStatement;
