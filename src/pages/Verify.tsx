
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';
import QRCodeGenerator from '../components/security/QRCodeGenerator';

const VerifyDocument: React.FC = () => {
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('id');
  const hash = searchParams.get('hash');
  
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  
  useEffect(() => {
    // If we have both document ID and hash in URL, auto-verify
    if (documentId && hash) {
      verifyDocument(documentId, hash);
    }
  }, [documentId, hash]);
  
  const verifyDocument = (id: string, documentHash: string) => {
    setVerificationState('verifying');
    
    // In a real app, this would make an API call to verify the document
    setTimeout(() => {
      // For demo purposes, we'll consider any document with matching ID and hash valid
      if (id && documentHash) {
        setVerificationState('verified');
        setDocumentDetails({
          id,
          hash: documentHash,
          timestamp: Date.now() - 3600000, // 1 hour ago
          type: 'Transaction Report',
          issuer: 'D1 Project'
        });
      } else {
        setVerificationState('failed');
      }
    }, 2000);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would scan QR codes from uploaded files
    // For now, we'll just simulate verification
    setVerificationState('verifying');
    
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      if (Math.random() > 0.3) {
        setVerificationState('verified');
        setDocumentDetails({
          id: 'DOC-' + Date.now(),
          hash: 'abc123',
          timestamp: Date.now() - 7200000, // 2 hours ago
          type: 'Cash Flow Statement',
          issuer: 'D1 Project'
        });
      } else {
        setVerificationState('failed');
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
  
  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4">
      <div className="max-w-4xl mx-auto mt-10">
        <div className="neo-card">
          <h1 className="text-3xl font-bold mb-6">Document Verification</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl font-bold mb-4">Verify a Document</h2>
              <p className="mb-6">
                Verify the authenticity of documents exported from D1 Project. 
                Upload a document or scan its QR code to check if it's authentic and hasn't been tampered with.
              </p>
              
              {!documentId || !hash ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    accept=".pdf,.xlsx"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="document-upload" className="cursor-pointer block">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-lg font-medium">Upload a document or scan QR code</p>
                    <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, Excel</p>
                  </label>
                </div>
              ) : null}
            </div>
            
            <div className={`verification-result ${verificationState !== 'idle' ? 'border-2 p-6 rounded-lg' : ''}`}>
              {verificationState === 'idle' && (documentId || hash) && (
                <div className="flex flex-col items-center justify-center h-full">
                  <Button onClick={() => verifyDocument(documentId || '', hash || '')}>
                    Verify Document
                  </Button>
                </div>
              )}
              
              {verificationState === 'verifying' && (
                <div className="flex flex-col items-center justify-center h-full py-10">
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
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
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
                  
                  <div className="mt-6">
                    <p className="text-sm">Share this verification link:</p>
                    <div className="flex mt-2">
                      <input 
                        type="text"
                        readOnly
                        value={`${window.location.origin}/verify?id=${documentDetails.id}&hash=${documentDetails.hash}`}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                      />
                      <Button className="rounded-l-none">Copy</Button>
                    </div>
                  </div>
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
                  <Button onClick={() => setVerificationState('idle')}>
                    Try Another Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDocument;
