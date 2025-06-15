
import { Transaction } from '../../../services/SmsReader';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { toast } from 'sonner';
import {
  createTransactionBreakdownChart,
  createRecipientsAreaChart,
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
    // Get metadata and currency
    console.log('Getting PDF metadata and currency...');
    const { metadata } = getPDFMetadata(transactions, quarterInfo);
    const mainCurrency = getMainCurrency(transactions);
    console.log('Main currency determined:', mainCurrency);
    
    // Prepare chart data with detailed logging
    console.log('Preparing chart data...');
    const { chartData, recipientsData, feesChartData, totalsByType, totalTaxes } = 
      prepareChartData(transactions);
    
    console.log('Chart data prepared successfully:', {
      chartDataLength: chartData.length,
      recipientsDataLength: recipientsData.length,
      feesChartDataLength: feesChartData.length,
      totalsByType,
      totalTaxes
    });
    
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
    
    // Add period information
    console.log('Adding period information...');
    yPosition = addPeriodInfo(doc, yPosition, quarterInfo);
    console.log('Period info added, current Y position:', yPosition);
    
    // Add transaction summary
    console.log('Adding transaction summary...');
    yPosition = addTransactionSummary(
      doc, yPosition, transactions, totalsByType, 
      totalFees, totalTaxes, mainCurrency
    );
    console.log('Transaction summary added, current Y position:', yPosition);
    
    // Add transaction breakdown chart
    console.log('Creating transaction breakdown chart...');
    if (chartData.length > 0) {
      const chartImage = createTransactionBreakdownChart(chartData);
      if (chartImage) {
        console.log('Transaction breakdown chart created successfully');
        yPosition = addChartSection(
          doc, yPosition, 
          "TRANSACTION BREAKDOWN BY TYPE (AREA CHART)", 
          chartImage
        );
        console.log('Transaction breakdown chart added to PDF, current Y position:', yPosition);
      } else {
        console.error('Failed to create transaction breakdown chart');
      }
    } else {
      console.warn('No chart data available for transaction breakdown');
    }
    
    // Add recipients area chart
    console.log('Creating recipients area chart...');
    if (recipientsData.length > 0) {
      const recipientsImage = createRecipientsAreaChart(recipientsData);
      if (recipientsImage) {
        console.log('Recipients area chart created successfully');
        yPosition = addChartSection(
          doc, yPosition, 
          "TOP RECIPIENTS - TRANSACTION FREQUENCY", 
          recipientsImage,
          190, 100
        );
        console.log('Recipients chart added to PDF, current Y position:', yPosition);
      } else {
        console.error('Failed to create recipients area chart');
      }
    } else {
      console.warn('No recipients data available for chart');
    }
    
    // Add fees & taxes pie chart
    console.log('Creating fees & taxes pie chart...');
    if (feeTaxData.length > 0) {
      const feesTaxesImage = createFeeTaxPieChart(feeTaxData, mainCurrency);
      if (feesTaxesImage) {
        console.log('Fees & taxes pie chart created successfully');
        yPosition = addChartSection(
          doc, yPosition, 
          "FEES & TAXES BREAKDOWN", 
          feesTaxesImage,
          190, 100
        );
        console.log('Fees & taxes chart added to PDF, current Y position:', yPosition);
      } else {
        console.error('Failed to create fees & taxes pie chart');
      }
    } else {
      console.warn('No fees/taxes data available for pie chart');
    }
    
    // Add security footer
    console.log('Adding security footer...');
    addSecurityFooter(doc, yPosition, metadata);
    
    // Generate filename and save
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
