
import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { CheckCircle, XCircle, Upload, Loader2, ScanLine } from 'lucide-react';
import { toast } from 'sonner';

interface FileVerifierProps {
  className?: string;
}

const FileVerifier: React.FC<FileVerifierProps> = ({ className = '' }) => {
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setVerificationState('verifying');
    
    // In a real app, this would analyze the file and extract verification info
    // For now, we'll simulate the verification process
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      if (Math.random() > 0.3) {
        setVerificationState('verified');
        setDocumentDetails({
          id: 'DOC-' + Date.now(),
          hash: 'abc123',
          timestamp: Date.now() - 7200000, // 2 hours ago
          type: file.name.toLowerCase().includes('cash') ? 'Cash Flow Statement' : 
                file.name.toLowerCase().includes('excel') ? 'Transaction Data' : 'Transaction Report',
          issuer: 'D1 Project'
        });
        toast.success("Document verified successfully!");
      } else {
        setVerificationState('failed');
        toast.error("Verification failed. This document could not be authenticated.");
      }
    }, 2000);
  };
  
  const handleScanQrCode = () => {
    setVerificationState('verifying');
    
    // In a real app, this would activate the camera to scan a QR code
    // For now, we'll simulate the verification process
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      if (Math.random() > 0.3) {
        setVerificationState('verified');
        setDocumentDetails({
          id: 'DOC-QR-' + Date.now(),
          hash: 'qr123',
          timestamp: Date.now() - 3600000, // 1 hour ago
          type: 'Transaction Report',
          issuer: 'D1 Project'
        });
        toast.success("QR code verified successfully!");
      } else {
        setVerificationState('failed');
        toast.error("QR code verification failed. Could not authenticate document.");
      }
    }, 2000);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  const resetVerification = () => {
    setVerificationState('idle');
    setDocumentDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Card className={`p-4 bg-white border-2 border-neo-black ${className}`}>
      <h3 className="font-bold text-xl mb-3">Verify Document Authenticity</h3>
      
      {verificationState === 'idle' && (
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload a report document or scan the QR code to verify its authenticity. This helps ensure the report hasn't been tampered with.
          </p>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="file"
                id="document-verification"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.xlsx"
              />
              <label 
                htmlFor="document-verification" 
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">Upload Document</span>
                <span className="text-xs text-gray-500 mt-1">PDF or Excel format</span>
              </label>
            </div>
            
            <div className="flex-1">
              <button
                onClick={handleScanQrCode}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition w-full h-full"
              >
                <ScanLine className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">Scan QR Code</span>
                <span className="text-xs text-gray-500 mt-1">From premium report</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {verificationState === 'verifying' && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
          <p className="text-lg font-medium">Verifying document...</p>
        </div>
      )}
      
      {verificationState === 'verified' && documentDetails && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-4">Document is Authentic</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between border-b pb-2 mb-2">
              <span className="font-medium">Document ID:</span>
              <span>{documentDetails.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2">
              <span className="font-medium">Type:</span>
              <span>{documentDetails.type}</span>
            </div>
            <div className="flex justify-between border-b pb-2 mb-2">
              <span className="font-medium">Generated:</span>
              <span>{formatDate(documentDetails.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Issuer:</span>
              <span>{documentDetails.issuer}</span>
            </div>
          </div>
          
          <Button onClick={resetVerification}>
            Verify Another Document
          </Button>
        </div>
      )}
      
      {verificationState === 'failed' && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-red-700 mb-4">Invalid Document</h3>
          <p className="mb-6">
            This document could not be verified. It may have been tampered with or is not from our system.
          </p>
          <Button onClick={resetVerification}>
            Try Another Document
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FileVerifier;
