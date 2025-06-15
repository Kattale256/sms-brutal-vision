
import { Transaction } from '../../../services/SmsReader';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { toast } from 'sonner';
import {
  createTransactionBreakdownChart,
  createFeeTaxPieChart
} from './pdfChartGenerator';
import { prepareChartData } from './prepareChartData';
import {
  getPDFMetadata,
  generatePDFFilename,
  getMainCurrency
} from './pdfMetadata';
import {
  createPDFDocument,
  addPDFHeader,
  addPeriodInfo,
  addTransactionSummary,
  addChartSection,
  addSecurityFooter
} from './pdfDocumentBuilder';

export const exportToPDF = (transactions: Transaction[], quarterInfo?: QuarterInfo | null) => {
  console.log('=== PDF Export Started ===');
  console.log('Transactions count:', transactions.length);
  console.log('Quarter info:', quarterInfo);
  
  if (!transactions || transactions.length === 0) {
    console.error('No transactions provided for PDF export');
    toast.error('No transactions available to export');
    return;
  }
  
  try {
    // Get metadata and currency with enhanced logging
    console.log('Getting PDF metadata and currency...');
    const { metadata } = getPDFMetadata(transactions, quarterInfo);
    const mainCurrency = getMainCurrency(transactions);
    console.log('Main currency determined:', mainCurrency);
    console.log('Metadata generated:', metadata);
    
    // Prepare chart data with detailed logging
    console.log('Preparing chart data...');
    const chartDataResult = prepareChartData(transactions);
    console.log('Chart data preparation result:', chartDataResult);
    
    const { feesChartData, totalsByType, totalTaxes } = chartDataResult;
    
    // Create fee/tax data for pie chart
    const feeTaxData = [];
    const totalFees = feesChartData.reduce((sum, item) => sum + item.fees, 0);
    console.log('Total fees calculated:', totalFees);
    
    if (totalFees > 0) feeTaxData.push({ name: 'Fees', value: totalFees });
    if (totalTaxes > 0) feeTaxData.push({ name: 'Taxes', value: totalTaxes });
    
    console.log('Fee/Tax data for pie chart:', feeTaxData);
    
    // Create PDF document
    console.log('Creating PDF document...');
    const doc = createPDFDocument();
    
    // Add header with enhanced error handling
    console.log('Adding PDF header...');
    let yPosition = addPDFHeader(doc, quarterInfo);
    console.log('Header added, current Y position:', yPosition);
    
    // Add period information with enhanced quarter details
    console.log('Adding period information...');
    yPosition = addPeriodInfo(doc, yPosition, quarterInfo, transactions);
    console.log('Period info added, current Y position:', yPosition);
    
    // Add transaction summary
    console.log('Adding transaction summary...');
    yPosition = addTransactionSummary(
      doc, yPosition, transactions, totalsByType, 
      totalFees, totalTaxes, mainCurrency
    );
    console.log('Transaction summary added, current Y position:', yPosition);
    
    // Add transaction breakdown area chart with enhanced error handling
    console.log('Creating transaction breakdown area chart...');
    if (transactions.length > 0) {
      console.log('Transaction data available:', transactions.length);
      const chartImage = createTransactionBreakdownChart(transactions);
      if (chartImage) {
        console.log('Transaction breakdown area chart created successfully');
        yPosition = addChartSection(
          doc, yPosition, 
          "TRANSACTION BREAKDOWN BY TYPE (AREA CHART)", 
          chartImage
        );
        console.log('Transaction breakdown chart added to PDF, current Y position:', yPosition);
      } else {
        console.error('Failed to create transaction breakdown area chart');
        // Add error message to PDF
        doc.setFontSize(12);
        doc.text('Transaction breakdown chart could not be generated', 20, yPosition);
        yPosition += 20;
      }
    } else {
      console.warn('No transaction data available for breakdown chart');
      doc.setFontSize(12);
      doc.text('No transaction data available for breakdown chart', 20, yPosition);
      yPosition += 20;
    }
    
    // Add fees & taxes pie chart with enhanced error handling and optimized sizing
    console.log('Creating fees & taxes pie chart...');
    if (feeTaxData.length > 0) {
      console.log('Fee/tax data available:', feeTaxData);
      const feesTaxesImage = createFeeTaxPieChart(feeTaxData, mainCurrency);
      if (feesTaxesImage) {
        console.log('Fees & taxes pie chart created successfully');
        yPosition = addChartSection(
          doc, yPosition, 
          "FEES & TAXES BREAKDOWN", 
          feesTaxesImage,
          190, 100 // Optimized dimensions for PDF
        );
        console.log('Fees & taxes chart added to PDF, current Y position:', yPosition);
      } else {
        console.error('Failed to create fees & taxes pie chart');
        doc.setFontSize(12);
        doc.text('Fees & taxes chart could not be generated', 20, yPosition);
        yPosition += 20;
      }
    } else {
      console.warn('No fees/taxes data available for pie chart');
      doc.setFontSize(12);
      doc.text('No fees or taxes data available for chart', 20, yPosition);
      yPosition += 20;
    }
    
    // Add security footer
    console.log('Adding security footer...');
    addSecurityFooter(doc, yPosition, metadata);
    
    // Generate filename and save with enhanced logging
    const filename = generatePDFFilename(quarterInfo);
    console.log('Generated filename:', filename);
    
    console.log('Saving PDF...');
    doc.save(filename);
    
    const message = quarterInfo ? 
      `AKAMEME Tax Report for ${quarterInfo.label} exported successfully!` :
      'AKAMEME Tax Report for Full Year exported successfully!';
      
    toast.success(message);
    
    console.log('=== PDF Export Completed Successfully ===');
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    toast.error('Failed to export PDF. Please check console for details.');
  }
};
