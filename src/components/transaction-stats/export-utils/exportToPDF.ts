
import jsPDF from 'jspdf';
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalTaxes,
  getFrequentContacts
} from '../../../utils/transactionAnalyzer';
import { generateDocumentMetadata, generateQRCodeData } from '../../../utils/securityUtils';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { toast } from 'sonner';

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
  const frequentContacts = getFrequentContacts(transactions);
  
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  // Enhanced color mapping with more distinct colors
  const typeColors = {
    send: '#FF6B35', // Bright orange
    receive: '#10B981', // Emerald green
    payment: '#3B82F6', // Blue
    withdrawal: '#8B5CF6', // Purple
    deposit: '#F59E0B', // Amber
    other: '#6B7280', // Gray
  };
  
  // Prepare chart data
  const chartData = Object.entries(totalsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, amount]) => ({
      name: typeLabels[type as keyof typeof typeLabels],
      amount: amount,
      color: typeColors[type as keyof typeof typeColors] || '#6B7280'
    }));
    
  const feeTaxData = [
    { name: 'Fees', value: totalFees, color: '#FF5252' },
    { name: 'Taxes', value: totalTaxes, color: '#FFC107' }
  ].filter(item => item.value > 0);
  
  // Prepare recipients data (top 5 without pointers)
  const recipientsData = Object.entries(frequentContacts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count], index) => ({
      name: name || 'Unknown',
      value: count,
      color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5]
    }));
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Title with AKAMEME branding
  doc.setFontSize(20);
  const title = quarterInfo ? 
    `AKAMEME TAX APP Report - ${quarterInfo.label}` :
    'AKAMEME TAX APP - Transaction Statistics Report';
  doc.text(title, 20, 20);
  
  let yPosition = 30;
  
  // Period info
  if (quarterInfo) {
    doc.setFontSize(12);
    doc.text(`Uganda Financial Year: ${quarterInfo.financialYear}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Reporting Period: ${quarterInfo.label}`, 20, yPosition);
    yPosition += 7;
    
    // Add quarter explanation
    doc.setFontSize(10);
    doc.text(`Q1: Jul-Sep | Q2: Oct-Dec | Q3: Jan-Mar | Q4: Apr-Jun`, 20, yPosition);
    yPosition += 15;
  } else {
    doc.setFontSize(12);
    doc.text(`Reporting Period: All Time (Full Financial Year)`, 20, yPosition);
    yPosition += 15;
  }
  
  // Transaction Breakdown Area Chart
  if (chartData.length > 0) {
    doc.setFontSize(16);
    doc.text("TRANSACTION BREAKDOWN", 20, yPosition);
    yPosition += 10;
    
    // Create canvas for area chart
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw area chart (stacked areas)
      const chartWidth = 400;
      const chartHeight = 200;
      const startX = 75;
      const startY = 50;
      const maxValue = chartData.reduce((sum, item) => sum + item.amount, 0);
      
      // Draw axes
      ctx.strokeStyle = '#1A1F2C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY + chartHeight);
      ctx.lineTo(startX + chartWidth, startY + chartHeight);
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY + chartHeight);
      ctx.stroke();
      
      // Create area chart with smooth curves
      const points = 10;
      let cumulativeHeight = 0;
      
      chartData.forEach((item, index) => {
        const areaHeight = (item.amount / maxValue) * chartHeight;
        
        ctx.fillStyle = item.color;
        ctx.beginPath();
        
        // Create smooth area curve
        for (let i = 0; i <= points; i++) {
          const x = startX + (i / points) * chartWidth;
          const y = startY + chartHeight - cumulativeHeight - areaHeight * (0.8 + 0.2 * Math.sin(i * 0.5));
          
          if (i === 0) {
            ctx.moveTo(x, startY + chartHeight - cumulativeHeight);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Complete the area
        ctx.lineTo(startX + chartWidth, startY + chartHeight - cumulativeHeight);
        ctx.lineTo(startX, startY + chartHeight - cumulativeHeight);
        ctx.closePath();
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#1A1F2C';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        cumulativeHeight += areaHeight;
      });
      
      // Add legend
      let legendY = 260;
      chartData.forEach((item, index) => {
        const legendX = 50 + (index % 3) * 150;
        if (index % 3 === 0 && index > 0) legendY += 20;
        
        // Legend color box
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY, 12, 12);
        ctx.strokeStyle = '#1A1F2C';
        ctx.strokeRect(legendX, legendY, 12, 12);
        
        // Legend text
        ctx.fillStyle = '#000';
        ctx.font = '11px Arial';
        ctx.fillText(`${item.name}: ${item.amount.toFixed(0)} ${mainCurrency}`, legendX + 18, legendY + 9);
      });
      
      // Add image to PDF
      doc.addImage(canvas.toDataURL(), 'PNG', 10, yPosition, 190, 100);
      yPosition += 110;
    }
  }
  
  // Recipients Chart (Simple bars without pointers)
  if (recipientsData.length > 0) {
    doc.setFontSize(16);
    doc.text("TOP RECIPIENTS", 20, yPosition);
    yPosition += 10;
    
    // Create canvas for recipients chart
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = 60;
      const barSpacing = 80;
      const maxValue = Math.max(...recipientsData.map(item => item.value));
      const chartHeight = 150;
      const startY = 40;
      
      recipientsData.forEach((item, index) => {
        const x = 50 + index * barSpacing;
        const barHeight = (item.value / maxValue) * chartHeight;
        const y = startY + chartHeight - barHeight;
        
        // Draw bar
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw border
        ctx.strokeStyle = '#1A1F2C';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw value on top
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x + barWidth/2, y - 5);
        
        // Draw name below (truncated if too long)
        const name = item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name;
        ctx.font = '10px Arial';
        ctx.fillText(name, x + barWidth/2, startY + chartHeight + 15);
      });
      
      // Add image to PDF
      doc.addImage(canvas.toDataURL(), 'PNG', 10, yPosition, 190, 80);
      yPosition += 90;
    }
  }
  
  // Fees & Taxes Pie Chart (without pointers)
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
      // Clear canvas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = 275;
      const centerY = 150;
      const radius = 100;
      
      let total = feeTaxData.reduce((sum, item) => sum + item.value, 0);
      let startAngle = 0;
      
      feeTaxData.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#1A1F2C';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label directly on slice (no pointers)
        const midAngle = startAngle + sliceAngle/2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, labelX, labelY - 5);
        ctx.fillText(`${item.value.toFixed(0)} ${mainCurrency}`, labelX, labelY + 10);
        ctx.fillText(`${Math.round(item.value/total*100)}%`, labelX, labelY + 25);
        
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
  
  // Add verification info with AKAMEME branding
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Document ID: ${metadata.documentId}`, 20, 270);
  doc.text(`Generated: ${new Date(metadata.timestamp).toLocaleString()}`, 20, 275);
  doc.text(`Built By KATTALE GROUP (UG) EST. 2015`, 20, 280);
  doc.text(`Verification URL: ${window.location.origin}/verify?id=${metadata.documentId}`, 20, 285);
  
  // Generate filename based on quarter info
  const periodText = quarterInfo ? 
    `_${quarterInfo.label.replace(/\//g, '_')}` : 
    '_All_Time';

  doc.save(`akameme-tax-app-report${periodText}.pdf`);
  
  toast.success(`AKAMEME TAX APP report exported successfully!`);
};
