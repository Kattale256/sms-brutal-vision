
import { ChartDataItem, RecipientDataItem } from './prepareChartData';

// Utility function to create canvas with error handling
const createCanvas = (width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get canvas 2D context');
      return null;
    }
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return { canvas, ctx };
  } catch (error) {
    console.error('Error creating canvas:', error);
    return null;
  }
};

// Create proper area chart for transaction breakdown
export const createTransactionBreakdownChart = (chartData: ChartDataItem[]): string | null => {
  try {
    console.log('Creating transaction breakdown area chart with data:', chartData);
    
    const canvasResult = createCanvas(800, 400);
    if (!canvasResult) return null;
    
    const { canvas, ctx } = canvasResult;
    
    if (chartData.length === 0) {
      console.error('No chart data provided');
      return null;
    }
    
    // Chart dimensions with proper margins
    const margin = { top: 60, right: 80, bottom: 100, left: 120 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Calculate scaling
    const maxValue = Math.max(...chartData.map(d => d.amount));
    if (maxValue === 0) {
      console.error('All chart values are zero');
      return null;
    }
    
    const yScale = chartHeight / (maxValue * 1.1); // 10% padding at top
    const xScale = chartWidth / Math.max(1, chartData.length - 1);
    
    // Colors for different transaction types
    const colors = ['#FF6B35', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Transaction Breakdown by Type (Area Chart)', canvas.width / 2, 35);
    
    // Create area chart path
    if (chartData.length >= 2) {
      // Create smooth area chart
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top + chartHeight);
      
      // Draw area path
      chartData.forEach((item, index) => {
        const x = margin.left + (index * xScale);
        const y = margin.top + chartHeight - (item.amount * yScale);
        
        if (index === 0) {
          ctx.lineTo(x, y);
        } else {
          // Create smooth curve
          const prevItem = chartData[index - 1];
          const prevX = margin.left + ((index - 1) * xScale);
          const prevY = margin.top + chartHeight - (prevItem.amount * yScale);
          
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
      });
      
      // Close the area
      ctx.lineTo(margin.left + ((chartData.length - 1) * xScale), margin.top + chartHeight);
      ctx.lineTo(margin.left, margin.top + chartHeight);
      ctx.closePath();
      
      // Fill area with gradient
      const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw area border
      ctx.beginPath();
      chartData.forEach((item, index) => {
        const x = margin.left + (index * xScale);
        const y = margin.top + chartHeight - (item.amount * yScale);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevItem = chartData[index - 1];
          const prevX = margin.left + ((index - 1) * xScale);
          const prevY = margin.top + chartHeight - (prevItem.amount * yScale);
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
      });
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Single data point - draw as area bar
      const item = chartData[0];
      const barWidth = Math.min(100, chartWidth * 0.3);
      const x = margin.left + (chartWidth - barWidth) / 2;
      const barHeight = item.amount * yScale;
      const y = margin.top + chartHeight - barHeight;
      
      // Draw gradient area
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Border
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barWidth, barHeight);
    }
    
    // Draw data points and labels
    chartData.forEach((item, index) => {
      const x = margin.left + (index * xScale);
      const y = margin.top + chartHeight - (item.amount * yScale);
      
      // Data point
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Value label above point
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const valueText = new Intl.NumberFormat().format(item.amount);
      ctx.fillText(valueText, x, y - 15);
      
      // Category label below chart
      ctx.save();
      ctx.translate(x, margin.top + chartHeight + 25);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.font = '11px Arial';
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
    });
    
    // Draw axes
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#666666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * i;
      const y = margin.top + chartHeight - (value / maxValue) * chartHeight;
      ctx.fillText(new Intl.NumberFormat().format(value), margin.left - 10, y + 4);
    }
    
    console.log('Transaction breakdown area chart created successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating transaction breakdown area chart:', error);
    return null;
  }
};

// Create proper area chart for recipients
export const createRecipientsAreaChart = (recipientsData: RecipientDataItem[]): string | null => {
  try {
    console.log('Creating recipients area chart with data:', recipientsData);
    
    const canvasResult = createCanvas(600, 300);
    if (!canvasResult) return null;
    
    const { canvas, ctx } = canvasResult;
    
    if (recipientsData.length === 0) {
      console.error('No recipients data provided');
      return null;
    }
    
    // Chart dimensions
    const margin = { top: 50, right: 50, bottom: 80, left: 80 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Take top 8 recipients for readability
    const topRecipients = recipientsData.slice(0, 8);
    const maxValue = Math.max(...topRecipients.map(d => d.value));
    
    if (maxValue === 0) {
      console.error('All recipient values are zero');
      return null;
    }
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Top Recipients - Transaction Frequency', canvas.width / 2, 30);
    
    if (topRecipients.length >= 2) {
      // Create area chart path
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top + chartHeight);
      
      topRecipients.forEach((item, index) => {
        const x = margin.left + (index / (topRecipients.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
      ctx.closePath();
      
      // Fill area with gradient
      const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw line
      ctx.beginPath();
      topRecipients.forEach((item, index) => {
        const x = margin.left + (index / (topRecipients.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Add data points
      topRecipients.forEach((item, index) => {
        const x = margin.left + (index / (topRecipients.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Value label
        ctx.fillStyle = '#000000';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x, y - 10);
      });
    }
    
    // Draw axes
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();
    
    // X-axis  
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    console.log('Recipients area chart created successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating recipients area chart:', error);
    return null;
  }
};

// Create improved pie chart for fees and taxes
export const createFeeTaxPieChart = (feeTaxData: { name: string; value: number }[], currency: string): string | null => {
  try {
    console.log('Creating fee/tax pie chart with data:', feeTaxData);
    
    const canvasResult = createCanvas(400, 400);
    if (!canvasResult) return null;
    
    const { canvas, ctx } = canvasResult;
    
    if (feeTaxData.length === 0) {
      console.error('No fee/tax data provided');
      return null;
    }
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    const total = feeTaxData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      console.error('Total fee/tax value is zero');
      return null;
    }
    
    let currentAngle = -Math.PI / 2; // Start from top
    
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];
    
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
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw labels with lines
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius + 40;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;
      
      // Draw label line
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(labelAngle) * radius, centerY + Math.sin(labelAngle) * radius);
      ctx.lineTo(labelX, labelY);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = labelX > centerX ? 'left' : 'right';
      const percentage = Math.round((item.value / total) * 100);
      ctx.fillText(
        `${item.name}: ${new Intl.NumberFormat().format(item.value)} ${currency} (${percentage}%)`,
        labelX,
        labelY
      );
      
      currentAngle += sliceAngle;
    });
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fees & Taxes Breakdown', centerX, 30);
    
    console.log('Fee/tax pie chart created successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating fee/tax pie chart:', error);
    return null;
  }
};
