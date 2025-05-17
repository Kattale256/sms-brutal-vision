
import React, { useState } from 'react';
import { Transaction } from '../../services/SmsReader';
import { ExcelButton, PDFButton, handleExportToExcel, handleExportToPDF } from './buttons';
import { QuarterInfo } from '../../utils/quarterUtils';
import PaymentDialog from '../payment/PaymentDialog';
import { PaymentProduct, EXPORT_PRODUCTS } from '../../services/MoMoService';

interface ExportButtonsProps {
  transactions: Transaction[];
  selectedQuarter?: QuarterInfo | null;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ transactions, selectedQuarter }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PaymentProduct | null>(null);
  const [pendingExportType, setPendingExportType] = useState<'excel' | 'pdf' | null>(null);
  
  // Determine which product ID to use based on export type and quarter selection
  const getProductId = (exportType: 'excel' | 'pdf') => {
    if (selectedQuarter) {
      // Check if current quarter
      const isCurrentQuarter = true; // In a real app, compare with current date
      return `${exportType}-${isCurrentQuarter ? 'current-quarter' : 'full-year'}`;
    } else {
      // Full year product
      return `${exportType}-full-year`;
    }
  };
  
  const handleExportClick = (exportType: 'excel' | 'pdf') => {
    const productId = getProductId(exportType);
    const product = EXPORT_PRODUCTS[productId];
    
    if (product) {
      setSelectedProduct(product);
      setPendingExportType(exportType);
      setPaymentDialogOpen(true);
    }
  };
  
  const handlePaymentComplete = () => {
    // Execute the export after payment is confirmed
    if (pendingExportType === 'excel') {
      // Call the actual export function
      handleExportToExcel(transactions, selectedQuarter);
    } else if (pendingExportType === 'pdf') {
      // Call the actual export function
      handleExportToPDF(transactions, selectedQuarter);
    }
    
    // Reset state
    setPendingExportType(null);
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
      
      {paymentDialogOpen && selectedProduct && (
        <PaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          onPaymentComplete={handlePaymentComplete}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default ExportButtons;
