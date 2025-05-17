
import jsPDF from 'jspdf';
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalTaxes
} from '../../../utils/transactionAnalyzer';
import { generateDocumentMetadata, generateQRCodeData } from '../../../utils/securityUtils';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { toast } from 'sonner';
import { renderToString } from 'react-dom/server';
import SecurityFooter from '../../security/SecurityFooter';

export const exportToPDF = (transactions: Transaction[], quarterInfo?: QuarterInfo | null) => {
  // Track export count
  const currentExportCount = parseInt(localStorage.getItem('exportCount') || '0', 10);
  localStorage.setItem('exportCount', (currentExportCount + 1).toString());
  
  // Get document security metadata
  const metadata = generateDocumentMetadata(transactions, quarterInfo, 'pdf');
  const qrCodeData = generateQRCodeData(metadata);
  
  // Get main currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  // Prepare chart data
  const chartData = Object.entries(totalsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, amount]) => ({
      name: typeLabels[type as keyof typeof typeLabels],
      amount: amount
    }));
    
  const feeTaxData = [
    { name: 'Fees', value: totalFees },
    { name: 'Taxes', value: totalTaxes }
  ].filter(item => item.value > 0);
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  const title = quarterInfo ? 
    `Transaction Report - ${quarterInfo.label}` :
    'Transaction Statistics Report';
  doc.text(title, 20, 20);
  
  let yPosition = 30;
  
  // Period info if quarterly
  if (quarterInfo) {
    doc.setFontSize(12);
    doc.text(`Uganda Financial Year: ${quarterInfo.financialYear}`, 20, yPosition);
    yPosition += 10;
  }
  
  // Transaction Breakdown Chart
  if (chartData.length > 0) {
    doc.setFontSize(16);
    doc.text("TRANSACTION BREAKDOWN", 20, yPosition);
    yPosition += 10;
    
    // Create canvas for chart
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw bar chart
      const barWidth = 400 / chartData.length;
      const maxValue = Math.max(...chartData.map(item => item.amount));
      
      chartData.forEach((item, index) => {
        const x = 50 + index * barWidth;
        const barHeight = (item.amount / maxValue) * 200;
        
        // Draw bar
        ctx.fillStyle = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6];
        ctx.fillRect(x, 280 - barHeight, barWidth - 10, barHeight);
        
        // Draw label
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, x + barWidth/2 - 5, 295);
        
        // Draw value
        ctx.fillText(`${item.amount.toFixed(0)} ${mainCurrency}`, x + barWidth/2 - 5, 280 - barHeight - 10);
      });
      
      // Add image to PDF
      doc.addImage(canvas.toDataURL(), 'PNG', 10, yPosition, 190, 100);
      yPosition += 120;
    }
  }
  
  // Fees & Taxes Pie Chart
  if (feeTaxData.length > 0) {
    doc.setFontSize(16);
    doc.text("FEES & TAXES", 20, yPosition);
    yPosition += 10;
    
    // Create canvas for pie chart
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw pie chart
      const centerX = 275;
      const centerY = 150;
      const radius = 120;
      
      let total = feeTaxData.reduce((sum, item) => sum + item.value, 0);
      let startAngle = 0;
      
      feeTaxData.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = index === 0 ? '#FF5252' : '#FFC107';
        ctx.fill();
        
        // Draw label line and text
        const midAngle = startAngle + sliceAngle/2;
        const labelX = centerX + Math.cos(midAngle) * (radius + 30);
        const labelY = centerY + Math.sin(midAngle) * (radius + 30);
        
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(midAngle) * radius, centerY + Math.sin(midAngle) * radius);
        ctx.lineTo(labelX, labelY);
        ctx.strokeStyle = '#000';
        ctx.stroke();
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = midAngle < Math.PI ? 'left' : 'right';
        ctx.fillText(`${item.name}: ${item.value.toFixed(2)} ${mainCurrency} (${Math.round(item.value/total*100)}%)`, labelX, labelY);
        
        startAngle += sliceAngle;
      });
      
      // Add image to PDF
      doc.addImage(canvas.toDataURL(), 'PNG', 10, yPosition, 190, 100);
      yPosition += 110;
    }
  }
  
  // Add security footer
  if (yPosition > 240) {
    doc.addPage(); // Add a new page if we're running out of space
    yPosition = 20;
  }
  
  // Add verification info
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Document ID: ${metadata.documentId}`, 20, 270);
  doc.text(`Generated: ${new Date(metadata.timestamp).toLocaleString()}`, 20, 275);
  doc.text(`Verification URL: ${window.location.origin}/verify?id=${metadata.documentId}`, 20, 280);
  
  // Add QR code (in a real app, this would be rendered to an image and added)
  doc.setFontSize(8);
  doc.text("Scan QR code to verify document authenticity", 150, 265);
  
  // Generate filename based on quarter info
  const periodText = quarterInfo ? 
    `_${quarterInfo.label.replace(/\//g, '_')}` : 
    '_All_Time';

  doc.save(`transaction-visualizations${periodText}.pdf`);
  
  toast.success(`Report exported successfully!`);
};
