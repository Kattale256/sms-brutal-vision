
import jsPDF from 'jspdf';
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalTaxes
} from '../../../utils/transactionAnalyzer';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { toast } from 'sonner';
import { createTransactionBreakdownChart, createFeeTaxPieChart } from './pdfChartGenerator';
import { prepareChartData } from './prepareChartData';

export const exportFreeToPDF = (transactions: Transaction[], quarterInfo?: QuarterInfo | null) => {
  console.log('=== Free PDF Export Started ===');
  console.log('Transactions count:', transactions.length);
  console.log('Quarter info:', quarterInfo);
  
  if (!transactions || transactions.length === 0) {
    toast.error('No transactions available to export');
    return;
  }

  try {
    // Get main currency
    const currencyMap: Record<string, number> = {};
    transactions.forEach(t => {
      currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
    });
    const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
    
    // Prepare chart data using the same function as premium
    const { chartData, feesChartData, totalsByType, totalTaxes } = prepareChartData(transactions);
    const totalFees = feesChartData.reduce((sum, item) => sum + item.fees, 0);
    
    // Create fee/tax data for pie chart
    const feeTaxData = [];
    if (totalFees > 0) feeTaxData.push({ name: 'Fees', value: totalFees });
    if (totalTaxes > 0) feeTaxData.push({ name: 'Taxes', value: totalTaxes });
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Title with FREE VERSION marker
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = quarterInfo ? 
      `AKAMEME Tax Report - ${quarterInfo.label} (FREE VERSION)` :
      'AKAMEME Tax Report - Full Year (FREE VERSION)';
    doc.text(title, 20, 20);
    
    let yPosition = 35;
    
    // Period info if quarterly
    if (quarterInfo) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Uganda Financial Year: ${quarterInfo.financialYear}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Quarter: Q${quarterInfo.quarter}`, 20, yPosition);
      yPosition += 15;
    } else {
      doc.setFontSize(12);
      doc.text('Period: Full Financial Year (All Time)', 20, yPosition);
      yPosition += 15;
    }
    
    // Transaction summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Transaction Summary (${transactions.length} transactions)`, 20, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const totalAmount = Object.values(totalsByType).reduce((sum, val) => sum + val, 0);
    doc.text(`Total Amount: ${totalAmount.toLocaleString()} ${mainCurrency}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Total Fees: ${totalFees.toLocaleString()} ${mainCurrency}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Total Taxes: ${totalTaxes.toLocaleString()} ${mainCurrency}`, 20, yPosition);
    yPosition += 15;
    
    // Transaction Breakdown Chart using the same function as premium
    if (chartData.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("TRANSACTION BREAKDOWN BY TYPE", 20, yPosition);
      yPosition += 10;
      
      console.log('Creating transaction breakdown chart for free PDF...');
      const chartImage = createTransactionBreakdownChart(chartData);
      if (chartImage) {
        console.log('Chart created successfully, adding to PDF');
        doc.addImage(chartImage, 'PNG', 10, yPosition, 190, 100);
        yPosition += 120;
      } else {
        console.error('Failed to create chart for free PDF');
        doc.setFontSize(12);
        doc.text('Chart could not be generated', 20, yPosition);
        yPosition += 20;
      }
    }
    
    // Fees & Taxes Chart using the same function as premium
    if (feeTaxData.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("FEES & TAXES BREAKDOWN", 20, yPosition);
      yPosition += 10;
      
      console.log('Creating fees & taxes chart for free PDF...');
      const feesTaxesImage = createFeeTaxPieChart(feeTaxData, mainCurrency);
      if (feesTaxesImage) {
        console.log('Fees & taxes chart created successfully, adding to PDF');
        doc.addImage(feesTaxesImage, 'PNG', 10, yPosition, 190, 100);
        yPosition += 110;
      } else {
        console.error('Failed to create fees & taxes chart for free PDF');
        doc.setFontSize(12);
        doc.text('Fees & taxes chart could not be generated', 20, yPosition);
        yPosition += 20;
      }
    }
    
    // Add copyright and disclosure
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Copyright info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.text("FREE BASIC VERSION", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text("This is a basic free version without advanced security features.", 20, yPosition);
    yPosition += 7;
    doc.text(`Report Period: ${quarterInfo ? quarterInfo.label : "Full Financial Year"}`, 20, yPosition);
    yPosition += 14;
    
    // Disclosure
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("DISCLOSURE", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("This free version is provided courtesy of UATEA-Uganda.", 20, yPosition);
    yPosition += 7;
    doc.text("For premium secured version with verification features, please purchase the premium version.", 20, yPosition);
    yPosition += 14;
    doc.text(`© ${new Date().getFullYear()} FIRM D1, LDC KAMPALA`, 20, yPosition);
    
    // Generate filename based on quarter info
    const periodText = quarterInfo ? 
      `_${quarterInfo.label.replace(/\//g, '_')}` : 
      '_All_Time';

    const filename = `AKAMEME_Tax_Report${periodText}_FREE.pdf`;
    console.log('Generated filename:', filename);
    
    doc.save(filename);
    
    toast.success(`Free report exported successfully!`);
    console.log('=== Free PDF Export Completed Successfully ===');
    
  } catch (error) {
    console.error('Free PDF Export Error:', error);
    toast.error('Failed to export free PDF. Please check console for details.');
  }
};
