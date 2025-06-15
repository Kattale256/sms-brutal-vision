
import jsPDF from 'jspdf';
import { Transaction } from '../../../services/SmsReader';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { getQuarterMonths } from './pdfMetadata';

export const createPDFDocument = (): jsPDF => {
  return new jsPDF();
};

export const addPDFHeader = (
  doc: jsPDF, 
  quarterInfo?: QuarterInfo | null
): number => {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = quarterInfo ? 
    `AKAMEME TAX APP Report - ${quarterInfo.label}` :
    'AKAMEME TAX APP - Full Year Report';
  doc.text(title, 20, 20);
  
  return 35; // Return next Y position
};

export const addPeriodInfo = (
  doc: jsPDF, 
  yPosition: number, 
  quarterInfo?: QuarterInfo | null
): number => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0);
  
  if (quarterInfo) {
    doc.text(`REPORTING PERIOD: ${quarterInfo.label}`, 20, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Uganda Financial Year: ${quarterInfo.financialYear}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Quarter Details: ${quarterInfo.label} (${getQuarterMonths(quarterInfo.quarter)})`, 20, yPosition);
    yPosition += 12;
  } else {
    doc.text(`REPORTING PERIOD: Full Financial Year (All Time)`, 20, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Showing all transactions across all quarters`, 20, yPosition);
    yPosition += 12;
  }
  
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
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Transaction Summary (${transactions.length} total transactions)`, 20, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const totalAmount = Object.values(totalsByType).reduce((sum, val) => sum + val, 0);
  doc.text(`Total Amount: ${totalAmount.toLocaleString()} ${mainCurrency}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Total Fees: ${totalFees.toLocaleString()} ${mainCurrency}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Total Taxes: ${totalTaxes.toLocaleString()} ${mainCurrency}`, 20, yPosition);
  
  return yPosition + 15;
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
  doc.text(title, 20, yPosition);
  yPosition += 10;
  
  try {
    doc.addImage(imageData, 'PNG', 10, yPosition, width, height);
    console.log(`Chart "${title}" added successfully at position:`, yPosition);
  } catch (error) {
    console.error(`Error adding chart "${title}" to PDF:`, error);
    // Add error text instead of image
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Error: Could not generate ${title.toLowerCase()}`, 20, yPosition + 20);
    height = 40; // Adjust height for error text
  }
  
  return yPosition + height + 10;
};

export const addSecurityFooter = (
  doc: jsPDF,
  yPosition: number,
  metadata: any
): void => {
  if (yPosition > 240) {
    doc.addPage();
  }
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Document ID: ${metadata.documentId}`, 20, 270);
  doc.text(`Generated: ${new Date(metadata.timestamp).toLocaleString()}`, 20, 275);
  doc.text(`Built By KATTALE GROUP (UG) EST. 2015 - AKAMEME TAX APP`, 20, 280);
  doc.text(`Verification: ${window.location.origin}/verify?id=${metadata.documentId}`, 20, 285);
};
