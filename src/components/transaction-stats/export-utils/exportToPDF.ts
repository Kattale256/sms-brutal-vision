
import jsPDF from 'jspdf';
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getTotalFees, 
  getFrequentContacts,
  getFeesByDate,
  getTotalTaxes
} from '../../../utils/transactionAnalyzer';

export const exportToPDF = (transactions: Transaction[]) => {
  // Track export count
  const currentExportCount = parseInt(localStorage.getItem('exportCount') || '0', 10);
  localStorage.setItem('exportCount', (currentExportCount + 1).toString());
  
  // Get main currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  const totalsByType = getTotalsByType(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  const frequentContacts = getFrequentContacts(transactions);
  const feesByDate = getFeesByDate(transactions);
  
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
    
  const recipientsData = Object.entries(frequentContacts)
    .map(([name, count]) => ({
      name: name || 'Unknown',
      value: count
    }));
    
  const feesChartData = Object.entries(feesByDate).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fees: amount
  }));
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text("Transaction Statistics Visualizations", 20, 20);
  
  let yPosition = 30;
  
  // Transaction Summary Chart
  if (chartData.length > 0) {
    doc.setFontSize(16);
    doc.text("TRANSACTION SUMMARY", 20, yPosition);
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
      yPosition += 110;
    }
  }
  
  // Taxes Chart
  if (totalTaxes > 0) {
    doc.setFontSize(16);
    doc.text("TAXES PAID", 20, yPosition);
    yPosition += 10;
    
    // Create canvas for tax chart
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#4BC0C0';
      ctx.fillRect(50, 150, 400, 50);
      
      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Taxes: ${totalTaxes.toFixed(2)} ${mainCurrency}`, 250, 180);
      
      // Add image to PDF
      doc.addImage(canvas.toDataURL(), 'PNG', 10, yPosition, 190, 80);
      yPosition += 90;
    }
  }
  
  // Recipients Pie Chart
  if (recipientsData.length > 0) {
    doc.setFontSize(16);
    doc.text("RECIPIENTS", 20, yPosition);
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
      
      let total = recipientsData.reduce((sum, item) => sum + item.value, 0);
      let startAngle = 0;
      
      recipientsData.slice(0, 5).forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6];
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
        ctx.fillText(`${item.name}: ${Math.round(item.value/total*100)}%`, labelX, labelY);
        
        startAngle += sliceAngle;
      });
      
      // Add image to PDF
      doc.addImage(canvas.toDataURL(), 'PNG', 10, yPosition, 190, 100);
      yPosition += 110;
    }
  }
  
  // Fees Chart
  if (feesChartData.length > 0) {
    doc.setFontSize(16);
    doc.text("FEES OVER TIME", 20, yPosition);
    yPosition += 10;
    
    // Create canvas for line chart
    const canvas = document.createElement('canvas');
    canvas.width = 550;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw line chart
      const maxValue = Math.max(...feesChartData.map(item => item.fees));
      const points = feesChartData.map((item, index) => ({
        x: 50 + (index * 450 / (feesChartData.length - 1 || 1)),
        y: 280 - (item.fees / maxValue) * 200
      }));
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(points[0]?.x || 0, points[0]?.y || 0);
      points.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = '#FFC107';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFC107';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Add image to PDF
      doc.addImage(canvas.toDataURL(), 'PNG', 10, yPosition, 190, 100);
    }
  }
  
  doc.save("transaction-visualizations.pdf");
};
