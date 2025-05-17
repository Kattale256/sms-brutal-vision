
import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';

interface SecurityFooterProps {
  documentId: string;
  timestamp: number;
  verificationUrl: string;
  quarter?: string;
}

const SecurityFooter: React.FC<SecurityFooterProps> = ({
  documentId,
  timestamp,
  verificationUrl,
  quarter
}) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <div className="security-footer flex flex-col items-center mt-8 pt-4 border-t border-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-3 w-full">
        <div className="flex flex-col">
          <h3 className="font-bold text-sm">Document Information</h3>
          <p className="text-xs">ID: {documentId}</p>
          <p className="text-xs">Generated: {formatDate(timestamp)}</p>
          {quarter && <p className="text-xs">Period: {quarter}</p>}
        </div>
        
        <div className="flex flex-col items-center">
          <h3 className="font-bold text-sm">Verification</h3>
          <QRCodeGenerator data={verificationUrl} size={100} className="mt-2" />
          <p className="text-xs text-center mt-1">Scan to verify</p>
        </div>
        
        <div className="flex flex-col items-end">
          <h3 className="font-bold text-sm">Security Notice</h3>
          <p className="text-xs text-right">This is a secure document with tamper detection.</p>
          <p className="text-xs text-right">© {new Date().getFullYear()} D1 Project LDC Kampala</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityFooter;
