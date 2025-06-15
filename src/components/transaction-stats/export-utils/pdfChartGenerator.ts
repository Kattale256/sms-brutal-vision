
import { ChartDataItem, RecipientDataItem } from './prepareChartData';

// Create area chart for transaction breakdown (matching the web app style)
export const createTransactionBreakdownChart = (chartData: ChartDataItem[]): string | null => {
  try {
    console.log('Creating transaction breakdown area chart with data:', chartData);
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || chartData.length === 0) {
      console.error('Canvas context not available or no chart data');
      return null;
    }
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions with proper margins
    const margin = { top: 50, right: 60, bottom: 80, left: 100 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Calculate scaling
    const maxValue = Math.max(...chartData.map(d => d.amount));
    const scale = chartHeight / (maxValue * 1.1); // 10% padding at top
    
    // Colors for different transaction types
    const colors = ['#FF6B35', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#6B7280'];
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Transaction Breakdown by Type (Area Chart)', canvas.width / 2, 30);
    
    // Draw area chart
    if (chartData.length > 1) {
      // Create area path
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top + chartHeight);
      
      chartData.forEach((item, index) => {
        const x = margin.left + (index / (chartData.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (item.amount * scale);
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
      ctx.closePath();
      
      // Fill area
      const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw line
      ctx.beginPath();
      chartData.forEach((item, index) => {
        const x = margin.left + (index / (chartData.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (item.amount * scale);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw data points and labels
      chartData.forEach((item, index) => {
        const x = margin.left + (index / (chartData.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (item.amount * scale);
        
        // Data point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Value label
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const valueText = new Intl.NumberFormat().format(item.amount);
        ctx.fillText(valueText, x, y - 15);
        
        // Category label
        ctx.save();
        ctx.translate(x, margin.top + chartHeight + 20);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'right';
        ctx.fillText(item.name, 0, 0);
        ctx.restore();
      });
    } else {
      // Single data point - draw as a simple bar
      const item = chartData[0];
      const barWidth = Math.min(100, chartWidth * 0.5);
      const x = margin.left + (chartWidth - barWidth) / 2;
      const barHeight = item.amount * scale;
      const y = margin.top + chartHeight - barHeight;
      
      ctx.fillStyle = colors[0];
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Label
      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x + barWidth / 2, margin.top + chartHeight + 30);
      ctx.fillText(new Intl.NumberFormat().format(item.amount), x + barWidth / 2, y - 10);
    }
    
    // Draw axes
    ctx.strokeStyle = '#000000';
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
    
    console.log('Transaction breakdown area chart created successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating transaction breakdown area chart:', error);
    return null;
  }
};

// Create area chart for recipients
export const createRecipientsAreaChart = (recipientsData: RecipientDataItem[]): string | null => {
  try {
    console.log('Creating recipients area chart with data:', recipientsData);
    
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || recipientsData.length === 0) {
      console.error('Canvas context not available or no recipients data');
      return null;
    }
    
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
    
    if (topRecipients.length > 1) {
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
      
      // Add data points
      topRecipients.forEach((item, index) => {
        const x = margin.left + (index / (topRecipients.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      });
    }
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Top Recipients - Transaction Frequency', canvas.width / 2, 25);
    
    console.log('Recipients area chart created successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating recipients area chart:', error);
    return null;
  }
};

// Create pie chart for fees and taxes
export const createFeeTaxPieChart = (feeTaxData: { name: string; value: number }[], currency: string): string | null => {
  try {
    console.log('Creating fee/tax pie chart with data:', feeTaxData);
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || feeTaxData.length === 0) {
      console.error('Canvas context not available or no fee/tax data');
      return null;
    }
    
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
    
    console.log('Fee/tax pie chart created successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating fee/tax pie chart:', error);
    return null;
  }
};
