
import { Transaction } from '../../../services/SmsReader';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { generateDocumentMetadata, generateQRCodeData } from '../../../utils/securityUtils';

export const getPDFMetadata = (transactions: Transaction[], quarterInfo?: QuarterInfo | null) => {
  const currentExportCount = parseInt(localStorage.getItem('exportCount') || '0', 10);
  localStorage.setItem('exportCount', (currentExportCount + 1).toString());
  
  const metadata = generateDocumentMetadata(transactions, quarterInfo, 'pdf');
  const qrCodeData = generateQRCodeData(metadata);
  
  return { metadata, qrCodeData };
};

export const generatePDFFilename = (quarterInfo?: QuarterInfo | null): string => {
  let filename = 'AKAMEME_Tax_Report';
  
  if (quarterInfo) {
    const fyParts = quarterInfo.financialYear.split('/');
    filename += `_Q${quarterInfo.quarter}_${fyParts[0]}-${fyParts[1]}`;
  } else {
    filename += '_Full_Year';
  }
  
  return filename + '.pdf';
};

export const getMainCurrency = (transactions: Transaction[]): string => {
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  return Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UGX';
};

export const getQuarterMonths = (quarter: number): string => {
  switch (quarter) {
    case 1: return 'Jul-Sep';
    case 2: return 'Oct-Dec';
    case 3: return 'Jan-Mar';
    case 4: return 'Apr-Jun';
    default: return 'Unknown';
  }
};
