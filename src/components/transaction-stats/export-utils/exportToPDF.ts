
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
  
  try {
    // Get metadata and currency
    const { metadata } = getPDFMetadata(transactions, quarterInfo);
    const mainCurrency = getMainCurrency(transactions);
    
    // Prepare chart data
    const { chartData, recipientsData, feesChartData, totalsByType, totalTaxes } = 
      prepareChartData(transactions);
    
    console.log('Chart data prepared:', { chartData, recipientsData, feesChartData });
    
    // Create fee/tax data for pie chart
    const feeTaxData = [];
    const totalFees = feesChartData.reduce((sum, item) => sum + item.fees, 0);
    if (totalFees > 0) feeTaxData.push({ name: 'Fees', value: totalFees });
    if (totalTaxes > 0) feeTaxData.push({ name: 'Taxes', value: totalTaxes });
    
    // Create PDF document
    const doc = createPDFDocument();
    
    // Add header
    let yPosition = addPDFHeader(doc, quarterInfo);
    
    // Add period information
    yPosition = addPeriodInfo(doc, yPosition, quarterInfo);
    
    // Add transaction summary
    yPosition = addTransactionSummary(
      doc, yPosition, transactions, totalsByType, 
      totalFees, totalTaxes, mainCurrency
    );
    
    // Add transaction breakdown chart
    if (chartData.length > 0) {
      const chartImage = createTransactionBreakdownChart(chartData);
      if (chartImage) {
        yPosition = addChartSection(
          doc, yPosition, 
          "TRANSACTION BREAKDOWN BY TYPE", 
          chartImage
        );
      }
    }
    
    // Add recipients area chart
    if (recipientsData.length > 0) {
      const recipientsImage = createRecipientsAreaChart(recipientsData);
      if (recipientsImage) {
        yPosition = addChartSection(
          doc, yPosition, 
          "TOP RECIPIENTS - TRANSACTION FREQUENCY", 
          recipientsImage,
          190, 100
        );
      }
    }
    
    // Add fees & taxes pie chart
    if (feeTaxData.length > 0) {
      const feesTaxesImage = createFeeTaxPieChart(feeTaxData, mainCurrency);
      if (feesTaxesImage) {
        yPosition = addChartSection(
          doc, yPosition, 
          "FEES & TAXES BREAKDOWN", 
          feesTaxesImage,
          190, 100
        );
      }
    }
    
    // Add security footer
    addSecurityFooter(doc, yPosition, metadata);
    
    // Generate filename and save
    const filename = generatePDFFilename(quarterInfo);
    console.log('Generated filename:', filename);
    
    doc.save(filename);
    
    const message = quarterInfo ? 
      `AKAMEME Tax Report for ${quarterInfo.label} exported successfully!` :
      'AKAMEME Tax Report for Full Year exported successfully!';
      
    toast.success(message);
    
    console.log('=== PDF Export Completed ===');
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    toast.error('Failed to export PDF. Please try again.');
  }
};
