import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PaymentProduct, momoService, generateReferenceId } from '../../services/MoMoService';
import { Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { toast } from "sonner";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  product: PaymentProduct;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  product
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'requesting' | 'pending' | 'successful' | 'failed'>('idle');
  const [referenceId, setReferenceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle');
      setError(null);
      setReferenceId('');
    }
  }, [isOpen]);
  
  // Check payment status periodically
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (paymentStatus === 'pending' && referenceId) {
      intervalId = setInterval(async () => {
        try {
          const status = await momoService.checkPaymentStatus(referenceId);
          
          if (status === 'SUCCESSFUL') {
            setPaymentStatus('successful');
            toast.success(`Payment successful for ${product.name}!`);
            setTimeout(() => {
              onPaymentComplete();
              onClose();
            }, 2000);
          } else if (status === 'FAILED') {
            setPaymentStatus('failed');
            setError('Payment was declined or failed. Please try again.');
          }
          // Keep checking if still pending
        } catch (err) {
          console.error('Error checking payment status:', err);
          setError('Failed to check payment status.');
          setPaymentStatus('failed');
        }
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentStatus, referenceId, onPaymentComplete, onClose, product.name]);
  
  const handleStartPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setError(null);
    setPaymentStatus('requesting');
    
    try {
      // Generate reference ID for this payment
      const ref = generateReferenceId();
      setReferenceId(ref);
      
      // Request payment via MoMo
      await momoService.requestPayment(phoneNumber, product, ref);
      
      // Update status to pending and start checking
      setPaymentStatus('pending');
      toast.info(`Payment request sent to ${phoneNumber}. Please check your phone.`);
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Failed to initiate payment. Please try again.');
      setPaymentStatus('failed');
    }
  };
  
  const formatPhoneNumber = (input: string) => {
    // Allow only digits
    const digits = input.replace(/\D/g, '');
    
    // Format as Ugandan phone number if possible
    if (digits.startsWith('256')) {
      return digits;
    } else if (digits.startsWith('0')) {
      return `256${digits.substring(1)}`;
    } else {
      return digits;
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };
  
  const renderContent = () => {
    switch (paymentStatus) {
      case 'idle':
        return (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (MTN MoMo)</Label>
                <div className="flex gap-2 items-center">
                  <div className="bg-yellow-100 px-2 py-1 border border-yellow-300 text-yellow-800">
                    +256
                  </div>
                  <Input
                    id="phone"
                    placeholder="77XXXXXXX or 78XXXXXXX"
                    value={phoneNumber.startsWith('256') ? phoneNumber.substring(3) : phoneNumber}
                    onChange={handlePhoneChange}
                  />
                </div>
                <p className="text-sm text-gray-500">Enter the MTN phone number to pay with Mobile Money</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold">Payment Details</h4>
                <div className="flex justify-between mt-2">
                  <span>Item:</span>
                  <span>{product.name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Price:</span>
                  <span className="font-bold">{product.price.toLocaleString()} UGX</span>
                </div>
              </div>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleStartPayment}>Pay Now</Button>
            </div>
          </>
        );
      
      case 'requesting':
        return (
          <div className="py-8 flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
            <p>Initiating payment request...</p>
          </div>
        );
      
      case 'pending':
        return (
          <div className="py-8 flex flex-col items-center space-y-4">
            <Phone className="h-16 w-16 text-yellow-500 animate-pulse" />
            <div className="text-center">
              <p className="font-bold">Payment request sent!</p>
              <p className="mt-2">Please check your phone and approve the payment for:</p>
              <p className="font-bold mt-1">{product.price.toLocaleString()} UGX</p>
              <div className="mt-4">
                <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                <span>Waiting for payment confirmation...</span>
              </div>
            </div>
          </div>
        );
      
      case 'successful':
        return (
          <div className="py-8 flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <p className="font-bold">Payment Successful!</p>
              <p className="mt-2">Thank you for your payment.</p>
              <p className="mt-1">Your export will begin shortly.</p>
            </div>
          </div>
        );
      
      case 'failed':
        return (
          <div className="py-8 flex flex-col items-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div className="text-center">
              <p className="font-bold">Payment Failed</p>
              <p className="mt-2">{error || 'There was an issue processing your payment.'}</p>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>MTN MoMo Payment</DialogTitle>
          <DialogDescription>
            Complete your payment to download the report
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
