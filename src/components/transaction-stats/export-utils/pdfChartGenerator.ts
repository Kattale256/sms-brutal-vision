
import { Transaction } from '../../../services/SmsReader';
import { ChartDataItem, RecipientDataItem } from './prepareChartData';

// Create canvas-based chart for transaction breakdown
export const createTransactionBreakdownChart = (chartData: ChartDataItem[]): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || chartData.length === 0) return null;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Calculate max value for scaling
    const maxValue = Math.max(...chartData.map(d => d.amount));
    const scale = chartHeight / maxValue;
    
    // Colors for bars
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    
    // Draw bars
    const barWidth = chartWidth / chartData.length * 0.8;
    const barSpacing = chartWidth / chartData.length * 0.2;
    
    chartData.forEach((item, index) => {
      const x = margin.left + index * (barWidth + barSpacing);
      const barHeight = item.amount * scale;
      const y = margin.top + chartHeight - barHeight;
      
      // Draw bar
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw value label on top of bar
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const valueText = new Intl.NumberFormat().format(item.amount);
      ctx.fillText(valueText, x + barWidth / 2, y - 5);
      
      // Draw category label
      ctx.save();
      ctx.translate(x + barWidth / 2, margin.top + chartHeight + 20);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
    });
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Transaction Breakdown by Type', canvas.width / 2, 25);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating transaction breakdown chart:', error);
    return null;
  }
};

// Create area chart for recipients
export const createRecipientsAreaChart = (recipientsData: RecipientDataItem[]): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || recipientsData.length === 0) return null;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Take top 10 recipients for readability
    const topRecipients = recipientsData.slice(0, 10);
    const maxValue = Math.max(...topRecipients.map(d => d.value));
    
    // Create area chart
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    
    topRecipients.forEach((item, index) => {
      const x = margin.left + (index / (topRecipients.length - 1)) * chartWidth;
      const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.closePath();
    
    // Fill area
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight - (topRecipients[0]?.value / maxValue) * chartHeight);
    topRecipients.forEach((item, index) => {
      const x = margin.left + (index / (topRecipients.length - 1)) * chartWidth;
      const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
      ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add data points (without pointers as requested)
    topRecipients.forEach((item, index) => {
      const x = margin.left + (index / (topRecipients.length - 1)) * chartWidth;
      const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
    });
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Top Recipients - Transaction Frequency', canvas.width / 2, 25);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating recipients area chart:', error);
    return null;
  }
};

// Create pie chart for fees and taxes
export const createFeeTaxPieChart = (feeTaxData: { name: string; value: number }[], currency: string): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || feeTaxData.length === 0) return null;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    const total = feeTaxData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top
    
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
    
    // Draw pie slices
    feeTaxData.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw labels
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
      
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = labelX > centerX ? 'left' : 'right';
      ctx.fillText(
        `${item.name}: ${new Intl.NumberFormat().format(item.value)} ${currency}`,
        labelX,
        labelY
      );
      
      currentAngle += sliceAngle;
    });
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fees & Taxes Breakdown', centerX, 30);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating fee/tax pie chart:', error);
    return null;
  }
};
