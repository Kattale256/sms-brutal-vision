
import jsPDF from 'jspdf';
import { Transaction } from '../../../services/SmsReader';
import { QuarterInfo, getAllQuartersInData } from '../../../utils/quarterUtils';
import { getQuarterMonths } from './pdfMetadata';

// Generate comprehensive all-time quarter summary
const generateAllTimeQuarterSummary = (transactions: Transaction[]): string => {
  const quarters = getAllQuartersInData(transactions);
  
  if (quarters.length === 0) return 'No quarter data available';
  
  const quarterSummaries = quarters.map(q => {
    const months = getQuarterMonths(q.quarter);
    return `${q.label} (${months})`;
  });
  
  return quarterSummaries.join(' | ');
};

export const createPDFDocument = (): jsPDF => {
  return new jsPDF();
};

export const addPDFHeader = (
  doc: jsPDF, 
  quarterInfo?: QuarterInfo | null
): number => {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  let title: string;
  if (quarterInfo) {
    const months = getQuarterMonths(quarterInfo.quarter);
    title = `AKAMEME TAX APP Report - ${quarterInfo.label} (${months})`;
  } else {
    title = 'AKAMEME TAX APP - Full Year Report (All Time)';
  }
  
  console.log('Adding PDF header with title:', title);
  doc.text(title, 20, 20);
  
  return 35; // Return next Y position
};

export const addPeriodInfo = (
  doc: jsPDF, 
  yPosition: number, 
  quarterInfo?: QuarterInfo | null,
  transactions?: Transaction[]
): number => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  
  if (quarterInfo) {
    const months = getQuarterMonths(quarterInfo.quarter);
    console.log('Adding quarter period info:', quarterInfo);
    doc.text(`REPORTING PERIOD: ${quarterInfo.label} (${months})`, 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Uganda Financial Year: ${quarterInfo.financialYear}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Quarter Details: Q${quarterInfo.quarter} - ${months}`, 20, yPosition);
    yPosition += 6;
    
    // Add specific quarter explanation with months
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`This report covers Q${quarterInfo.quarter} of FY ${quarterInfo.financialYear} (${months})`, 20, yPosition);
    yPosition += 12;
  } else {
    console.log('Adding full year period info with comprehensive quarter summary');
    doc.text(`REPORTING PERIOD: Full Financial Year (All Time)`, 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Showing all transactions across all quarters and years`, 20, yPosition);
    yPosition += 8;
    
    // Add comprehensive quarter summary for all-time reports
    if (transactions && transactions.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 50, 100);
      doc.text('QUARTERS INCLUDED IN THIS REPORT:', 20, yPosition);
      yPosition += 6;
      
      const quarterSummary = generateAllTimeQuarterSummary(transactions);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      // Split long quarter summary into multiple lines if needed
      const maxWidth = 170; // Maximum text width
      const lines = doc.splitTextToSize(quarterSummary, maxWidth);
      lines.forEach((line: string) => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
      
      yPosition += 5;
      
      // Add date range information
      const dates = transactions.map(t => new Date(t.timestamp)).sort((a, b) => a.getTime() - b.getTime());
      const earliestDate = dates[0]?.toLocaleDateString() || 'N/A';
      const latestDate = dates[dates.length - 1]?.toLocaleDateString() || 'N/A';
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Data Range: ${earliestDate} to ${latestDate}`, 20, yPosition);
      yPosition += 8;
    }
  }
  
  // Quarter explanation with month ranges
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Uganda FY Quarters: Q1 (Jul-Sep) | Q2 (Oct-Dec) | Q3 (Jan-Mar) | Q4 (Apr-Jun)`, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  
  return yPosition + 15;
};

export const addTransactionSummary = (
  doc: jsPDF,
  yPosition: number,
  transactions: Transaction[],
  totalsByType: Record<string, number>,
  totalFees: number,
  totalTaxes: number,
  mainCurrency: string
): number => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Transaction Summary (${transactions.length} total transactions)`, 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const totalAmount = Object.values(totalsByType).reduce((sum, val) => sum + val, 0);
  
  doc.text(`Total Amount: ${totalAmount.toLocaleString()} ${mainCurrency}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Total Fees: ${totalFees.toLocaleString()} ${mainCurrency}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Total Taxes: ${totalTaxes.toLocaleString()} ${mainCurrency}`, 20, yPosition);
  yPosition += 6;
  
  // Add breakdown by type
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const typeLabels = {
    send: 'Sent',
    receive: 'Received', 
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  Object.entries(totalsByType).forEach(([type, amount]) => {
    if (amount > 0) {
      const label = typeLabels[type as keyof typeof typeLabels] || type;
      doc.text(`${label}: ${amount.toLocaleString()} ${mainCurrency}`, 25, yPosition);
      yPosition += 4;
    }
  });
  
  doc.setTextColor(0, 0, 0);
  return yPosition + 10;
};

export const addChartSection = (
  doc: jsPDF,
  yPosition: number,
  title: string,
  imageData: string,
  width: number = 190,
  height: number = 120
): number => {
  // Check if we need a new page
  if (yPosition > 200) {
    console.log('Adding new page for chart:', title);
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, 20, yPosition);
  yPosition += 10;
  
  try {
    console.log(`Adding chart "${title}" to PDF at position:`, yPosition);
    doc.addImage(imageData, 'PNG', 10, yPosition, width, height);
    console.log(`Chart "${title}" added successfully`);
  } catch (error) {
    console.error(`Error adding chart "${title}" to PDF:`, error);
    // Add error text instead of image
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 0, 0);
    doc.text(`Error: Could not generate ${title.toLowerCase()}`, 20, yPosition + 20);
    height = 40; // Adjust height for error text
  }
  
  return yPosition + height + 15;
};

export const addSecurityFooter = (
  doc: jsPDF,
  yPosition: number,
  metadata: any
): void => {
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const footerY = 270;
  doc.text(`Document ID: ${metadata.documentId}`, 20, footerY);
  doc.text(`Generated: ${new Date(metadata.timestamp).toLocaleString()}`, 20, footerY + 5);
  doc.text(`Built By KATTALE GROUP (UG) EST. 2015 - AKAMEME TAX APP`, 20, footerY + 10);
  doc.text(`Verification: ${window.location.origin}/verify?id=${metadata.documentId}`, 20, footerY + 15);
};
