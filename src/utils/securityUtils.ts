
import { Transaction } from "../services/SmsReader";
import { QuarterInfo } from "./quarterUtils";

// Generate a hash for document verification
export const generateDocumentHash = (
  transactions: Transaction[],
  quarterInfo?: QuarterInfo,
  exportType?: string
): string => {
  const content = JSON.stringify({
    transactions: transactions.map(t => t.id),
    timestamp: Date.now(),
    quarter: quarterInfo?.label || 'All',
    exportType: exportType || 'unknown'
  });
  
  // Simple hash function - in production use a proper crypto library
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to base36 string for shorter representation
  return Math.abs(hash).toString(36);
};

// Generate document metadata for exports
export const generateDocumentMetadata = (
  transactions: Transaction[],
  quarterInfo?: QuarterInfo,
  exportType?: string
): {
  hash: string;
  timestamp: number;
  documentId: string;
  quarter?: string;
  exportType: string;
} => {
  const hash = generateDocumentHash(transactions, quarterInfo, exportType);
  const timestamp = Date.now();
  
  return {
    hash,
    timestamp,
    documentId: `DOC-${timestamp}-${hash.substring(0, 6)}`,
    quarter: quarterInfo?.label,
    exportType: exportType || 'unknown'
  };
};

// Convert metadata to a verification URL with document ID and hash
export const getVerificationUrl = (metadata: ReturnType<typeof generateDocumentMetadata>): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/verify?id=${metadata.documentId}&hash=${metadata.hash}`;
};

// Generate a QR code data for document verification
export const generateQRCodeData = (metadata: ReturnType<typeof generateDocumentMetadata>): string => {
  return getVerificationUrl(metadata);
};
