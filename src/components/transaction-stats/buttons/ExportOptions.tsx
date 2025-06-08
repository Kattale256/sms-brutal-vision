
import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Transaction } from '../../../services/sms/types';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { PaymentProduct, EXPORT_PRODUCTS } from '../../../services/MoMoService';
import PaymentDialog from '../../payment/PaymentDialog';
import { FileDown, Lock, X } from 'lucide-react';

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
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg sm:text-xl">Download {getExportTypeName()}</DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-sm">
              Choose between the free basic version or the premium secured version {getPeriodText()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Free Version Card */}
            <div 
              className="border-2 border-gray-300 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onFreeExport()}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base sm:text-lg">Free Basic Version</h3>
                  <div className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">
                    FREE
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Simple download without advanced security features
                </p>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Basic formatting</li>
                  <li>• Copyright information</li>
                  <li>• UATEA-Uganda disclosure</li>
                  <li>• Quarter period information</li>
                </ul>
                <Button className="w-full" variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" /> Download Free
                </Button>
              </div>
            </div>
            
            {/* Premium Version Card */}
            <div 
              className="border-2 border-yellow-300 p-4 rounded-lg hover:bg-yellow-50 cursor-pointer transition-colors"
              onClick={handlePremiumExport}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base sm:text-lg">Premium Secured Version</h3>
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded inline-flex items-center">
                    <Lock className="h-3 w-3 mr-1" /> PREMIUM
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Enhanced security and verification features
                </p>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Document verification</li>
                  <li>• QR code authentication</li>
                  <li>• Tamper detection</li>
                  <li>• Digital signature</li>
                  <li>• All features from free version</li>
                </ul>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" size="sm">
                  <Lock className="h-4 w-4 mr-2" /> 
                  Get Premium ({EXPORT_PRODUCTS[getProductId()]?.price || '5000'} UGX)
                </Button>
              </div>
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
