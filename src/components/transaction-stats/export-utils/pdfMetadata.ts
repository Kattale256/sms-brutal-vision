
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
    console.log('Generating filename for quarter:', quarterInfo);
    // Extract year components from financial year (e.g., "2023/24" -> "2023", "24")
    const fyParts = quarterInfo.financialYear.split('/');
    const startYear = fyParts[0];
    const endYear = fyParts[1];
    
    filename += `_Q${quarterInfo.quarter}_FY${startYear}-${endYear}`;
    console.log('Generated quarter filename:', filename);
  } else {
    console.log('Generating filename for full year');
    filename += '_Full_Year';
  }
  
  const finalFilename = filename + '.pdf';
  console.log('Final filename:', finalFilename);
  return finalFilename;
};

export const getMainCurrency = (transactions: Transaction[]): string => {
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const result = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UGX';
  console.log('Main currency determined:', result, 'from currencies:', Object.keys(currencyMap));
  return result;
};

export const getQuarterMonths = (quarter: number): string => {
  const months = {
    1: 'Jul-Sep',
    2: 'Oct-Dec', 
    3: 'Jan-Mar',
    4: 'Apr-Jun'
  };
  return months[quarter as keyof typeof months] || 'Unknown';
};
