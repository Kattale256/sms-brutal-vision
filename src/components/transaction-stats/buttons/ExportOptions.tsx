
import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { Transaction } from '../../../services/sms/types';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { PaymentProduct, EXPORT_PRODUCTS } from '../../../services/MoMoService';
import PaymentDialog from '../../payment/PaymentDialog';
import { FileDown, Lock } from 'lucide-react';

interface ExportOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: 'excel' | 'pdf' | 'cashflow';
  transactions: Transaction[];
  selectedQuarter?: QuarterInfo | null;
  onFreeExport: () => void;
  onPremiumExport: () => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  isOpen,
  onClose,
  exportType,
  transactions,
  selectedQuarter,
  onFreeExport,
  onPremiumExport
}) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  // Determine which product ID to use based on export type and quarter selection
  const getProductId = () => {
    if (selectedQuarter) {
      // Check if current quarter
      const isCurrentQuarter = true; // In a real app, compare with current date
      return `${exportType}-${isCurrentQuarter ? 'current-quarter' : 'full-year'}`;
    } else {
      // Full year product
      return `${exportType}-full-year`;
    }
  };
  
  const handlePremiumExport = () => {
    const productId = getProductId();
    const product = EXPORT_PRODUCTS[productId];
    
    if (product) {
      setPaymentDialogOpen(true);
    }
  };
  
  const handlePaymentComplete = () => {
    // Execute the premium export after payment is confirmed
    onPremiumExport();
  };

  const getExportTypeName = () => {
    switch(exportType) {
      case 'excel': return "Excel Report";
      case 'pdf': return "Transaction Visualizations PDF";
      case 'cashflow': return "Cash Flow Statement";
      default: return "Report";
    }
  };
  
  const getPeriodText = () => {
    return selectedQuarter ? 
      `for ${selectedQuarter.label}` : 
      "for Full Financial Year";
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export {getExportTypeName()}</DialogTitle>
            <DialogDescription>
              Choose between the free basic version or the premium secured version {getPeriodText()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div 
              className="border-2 p-4 rounded-lg hover:bg-gray-50 cursor-pointer flex flex-col h-full"
              onClick={() => onFreeExport()}
            >
              <h3 className="font-bold text-lg mb-2">Free Basic Version</h3>
              <p className="text-sm mb-4">Simple export without advanced security features</p>
              <ul className="text-xs space-y-1 flex-grow">
                <li>• Basic formatting</li>
                <li>• Copyright information</li>
                <li>• UATEA-Uganda disclosure</li>
                <li>• Quarter period information</li>
              </ul>
              <Button className="mt-4 w-full" variant="outline">
                <FileDown className="h-4 w-4 mr-2" /> Download Free
              </Button>
            </div>
            
            <div 
              className="border-2 p-4 rounded-lg hover:bg-gray-50 cursor-pointer flex flex-col h-full border-yellow-300"
              onClick={handlePremiumExport}
            >
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded inline-flex items-center self-start mb-2">
                <Lock className="h-3 w-3 mr-1" /> PREMIUM
              </div>
              <h3 className="font-bold text-lg mb-2">Premium Secured Version</h3>
              <p className="text-sm mb-4">Enhanced security and verification features</p>
              <ul className="text-xs space-y-1 flex-grow">
                <li>• Document verification</li>
                <li>• QR code authentication</li>
                <li>• Tamper detection</li>
                <li>• Digital signature</li>
                <li>• All features from free version</li>
              </ul>
              <Button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600">
                <Lock className="h-4 w-4 mr-2" /> Get Premium ({EXPORT_PRODUCTS[getProductId()]?.price} UGX)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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

export default ExportOptions;
