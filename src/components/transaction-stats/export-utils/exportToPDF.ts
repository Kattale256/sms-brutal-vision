
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
  console.log('=== PDF Export Started ===');
  console.log('Transactions count:', transactions.length);
  console.log('Quarter info:', quarterInfo);
  
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
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UGX';
  
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  const frequentContacts = getFrequentContacts(transactions);
  
  console.log('Data calculated:', { totalsByType, totalFees, totalTaxes, frequentContacts });
  
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
  
  // Prepare recipients data (top 5 for area chart)
  const recipientsData = Object.entries(frequentContacts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count], index) => ({
      name: name || 'Unknown',
      value: count,
      color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5]
    }));
  
  console.log('Chart data prepared:', { chartData, feeTaxData, recipientsData });
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Title with AKAMEME branding
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = quarterInfo ? 
    `AKAMEME TAX APP Report - ${quarterInfo.label}` :
    'AKAMEME TAX APP - Full Year Report';
  doc.text(title, 20, 20);
  
  let yPosition = 35;
  
  // Period info - Make this more prominent
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 0); // Dark green
  
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
  
  // Add quarter explanation
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Uganda FY Quarters: Q1 (Jul-Sep) | Q2 (Oct-Dec) | Q3 (Jan-Mar) | Q4 (Apr-Jun)`, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 15;
  
  // Transaction summary stats
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
  yPosition += 15;
  
  // Transaction Breakdown Area Chart
  if (chartData.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("TRANSACTION BREAKDOWN BY TYPE", 20, yPosition);
    yPosition += 10;
    
    // Create canvas for area chart
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 350;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Chart dimensions
      const chartWidth = 400;
      const chartHeight = 200;
      const startX = 75;
      const startY = 50;
      const maxValue = Math.max(...chartData.map(item => item.amount));
      
      // Draw chart background
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(startX, startY, chartWidth, chartHeight);
      
      // Draw grid lines
      ctx.strokeStyle = '#E9ECEF';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = startY + (i * chartHeight / 5);
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + chartWidth, y);
        ctx.stroke();
      }
      
      // Draw axes
      ctx.strokeStyle = '#1A1F2C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY + chartHeight);
      ctx.lineTo(startX + chartWidth, startY + chartHeight);
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY + chartHeight);
      ctx.stroke();
      
      // Create stacked area chart
      const points = 20;
      let cumulativeValues = new Array(points + 1).fill(0);
      
      // Draw areas from bottom to top
      chartData.forEach((item, dataIndex) => {
        ctx.fillStyle = item.color + '80'; // Add transparency
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        
        // Create smooth area curve
        for (let i = 0; i <= points; i++) {
          const x = startX + (i / points) * chartWidth;
          const baseValue = cumulativeValues[i];
          const areaHeight = (item.amount / maxValue) * chartHeight * (0.8 + 0.2 * Math.sin(i * 0.3 + dataIndex));
          const y = startY + chartHeight - baseValue - areaHeight;
          
          if (i === 0) {
            ctx.moveTo(x, startY + chartHeight - baseValue);
          } else {
            ctx.lineTo(x, y);
          }
          
          cumulativeValues[i] += areaHeight;
        }
        
        // Complete the area back to baseline
        for (let i = points; i >= 0; i--) {
          const x = startX + (i / points) * chartWidth;
          const baseValue = cumulativeValues[i] - (item.amount / maxValue) * chartHeight * (0.8 + 0.2 * Math.sin(i * 0.3 + dataIndex));
          const y = startY + chartHeight - baseValue;
          ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      
      // Add Y-axis labels
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const value = (maxValue * (5 - i) / 5).toFixed(0);
        const y = startY + (i * chartHeight / 5) + 4;
        ctx.fillText(value, startX - 10, y);
      }
      
      // Add legend with color boxes
      let legendY = 280;
      let legendX = 50;
      chartData.forEach((item, index) => {
        if (index > 0 && index % 2 === 0) {
          legendY += 20;
          legendX = 50;
        }
        
        // Legend color box
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY, 15, 15);
        ctx.strokeStyle = '#1A1F2C';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, 15, 15);
        
        // Legend text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.name}: ${item.amount.toLocaleString()} ${mainCurrency}`, legendX + 20, legendY + 11);
        
        legendX += 180;
      });
      
      // Add chart to PDF
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, yPosition, 190, 120);
      yPosition += 130;
    }
  }
  
  // Recipients Area Chart (without pointers)
  if (recipientsData.length > 0) {
    // Add new page if needed
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("TOP RECIPIENTS - TRANSACTION FREQUENCY", 20, yPosition);
    yPosition += 10;
    
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const chartWidth = 400;
      const chartHeight = 180;
      const startX = 75;
      const startY = 40;
      const maxValue = Math.max(...recipientsData.map(item => item.value));
      
      // Draw chart background
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(startX, startY, chartWidth, chartHeight);
      
      // Draw axes
      ctx.strokeStyle = '#1A1F2C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY + chartHeight);
      ctx.lineTo(startX + chartWidth, startY + chartHeight);
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY + chartHeight);
      ctx.stroke();
      
      // Create area chart for recipients
      const points = 15;
      recipientsData.forEach((item, dataIndex) => {
        ctx.fillStyle = item.color + '60'; // Semi-transparent
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        
        // Create smooth area for this recipient
        const areaHeight = (item.value / maxValue) * chartHeight;
        const xOffset = (dataIndex / recipientsData.length) * chartWidth;
        const areaWidth = chartWidth / recipientsData.length * 0.8;
        
        for (let i = 0; i <= points; i++) {
          const x = startX + xOffset + (i / points) * areaWidth;
          const heightVariation = Math.sin(i * 0.5) * 0.1 + 0.9;
          const y = startY + chartHeight - (areaHeight * heightVariation);
          
          if (i === 0) {
            ctx.moveTo(x, startY + chartHeight);
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Close the area
        ctx.lineTo(startX + xOffset + areaWidth, startY + chartHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add value label on top of area
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        const labelX = startX + xOffset + areaWidth / 2;
        ctx.fillText(item.value.toString(), labelX, startY + chartHeight - areaHeight - 10);
        
        // Add name below
        ctx.font = '10px Arial';
        const name = item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name;
        ctx.fillText(name, labelX, startY + chartHeight + 15);
      });
      
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, yPosition, 190, 100);
      yPosition += 110;
    }
  }
  
  // Fees & Taxes Pie Chart (enhanced without pointers)
  if (feeTaxData.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("FEES & TAXES BREAKDOWN", 20, yPosition);
    yPosition += 10;
    
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = 275;
      const centerY = 150;
      const radius = 100;
      
      let total = feeTaxData.reduce((sum, item) => sum + item.value, 0);
      let startAngle = 0;
      
      feeTaxData.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice with gradient effect
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, item.color + 'FF');
        gradient.addColorStop(1, item.color + '80');
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add percentage and value text directly on slice
        const midAngle = startAngle + sliceAngle / 2;
        const textRadius = radius * 0.6;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        const percentage = Math.round((item.value / total) * 100);
        ctx.strokeText(`${percentage}%`, textX, textY - 5);
        ctx.fillText(`${percentage}%`, textX, textY - 5);
        
        ctx.font = 'bold 12px Arial';
        ctx.strokeText(`${item.value.toLocaleString()} ${mainCurrency}`, textX, textY + 10);
        ctx.fillText(`${item.value.toLocaleString()} ${mainCurrency}`, textX, textY + 10);
        
        startAngle += sliceAngle;
      });
      
      // Add legend below chart
      let legendY = 260;
      feeTaxData.forEach((item, index) => {
        const legendX = 150 + (index * 150);
        
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY, 20, 15);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, 20, 15);
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, legendX + 25, legendY + 11);
      });
      
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, yPosition, 190, 100);
      yPosition += 110;
    }
  }
  
  // Add security footer on last page
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Document ID: ${metadata.documentId}`, 20, 270);
  doc.text(`Generated: ${new Date(metadata.timestamp).toLocaleString()}`, 20, 275);
  doc.text(`Built By KATTALE GROUP (UG) EST. 2015 - AKAMEME TAX APP`, 20, 280);
  doc.text(`Verification: ${window.location.origin}/verify?id=${metadata.documentId}`, 20, 285);
  
  // Generate enhanced filename with proper period identification
  let filename = 'AKAMEME_Tax_Report';
  
  if (quarterInfo) {
    // Format: AKAMEME_Tax_Report_Q1_2024-2025.pdf
    const fyParts = quarterInfo.financialYear.split('/');
    filename += `_Q${quarterInfo.quarter}_${fyParts[0]}-${fyParts[1]}`;
  } else {
    // Format: AKAMEME_Tax_Report_Full_Year.pdf
    filename += '_Full_Year';
  }
  
  filename += '.pdf';
  
  console.log('Generated filename:', filename);
  
  doc.save(filename);
  
  const message = quarterInfo ? 
    `AKAMEME Tax Report for ${quarterInfo.label} exported successfully!` :
    'AKAMEME Tax Report for Full Year exported successfully!';
    
  toast.success(message);
  
  console.log('=== PDF Export Completed ===');
};

// Helper function to get quarter months description
const getQuarterMonths = (quarter: number): string => {
  switch (quarter) {
    case 1: return 'Jul-Sep';
    case 2: return 'Oct-Dec';
    case 3: return 'Jan-Mar';
    case 4: return 'Apr-Jun';
    default: return 'Unknown';
  }
};
