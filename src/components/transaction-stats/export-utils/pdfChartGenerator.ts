
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalTaxes,
  getFrequentContacts
} from '../../../utils/transactionAnalyzer';

export interface ChartColors {
  send: string;
  receive: string;
  payment: string;
  withdrawal: string;
  deposit: string;
  other: string;
}

export const typeColors: ChartColors = {
  send: '#FF6B35',
  receive: '#10B981',
  payment: '#3B82F6',
  withdrawal: '#8B5CF6',
  deposit: '#F59E0B',
  other: '#6B7280',
};

export const typeLabels = {
  send: 'Sent',
  receive: 'Received',
  payment: 'Payments',
  withdrawal: 'Withdrawals',
  deposit: 'Deposits',
  other: 'Other'
};

export interface ChartDataItem {
  name: string;
  amount: number;
  color: string;
}

export const prepareChartData = (transactions: Transaction[]) => {
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  const frequentContacts = getFrequentContacts(transactions);
  
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
  
  const recipientsData = Object.entries(frequentContacts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count], index) => ({
      name: name || 'Unknown',
      value: count,
      color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5]
    }));
  
  return { chartData, feeTaxData, recipientsData, totalsByType, totalFees, totalTaxes };
};

export const createTransactionBreakdownChart = (chartData: ChartDataItem[]): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 550;
  canvas.height = 350;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
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
    ctx.fillStyle = item.color + '80';
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    
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
  
  // Add legend
  let legendY = 280;
  let legendX = 50;
  chartData.forEach((item, index) => {
    if (index > 0 && index % 2 === 0) {
      legendY += 20;
      legendX = 50;
    }
    
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.strokeStyle = '#1A1F2C';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 15, 15);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${item.name}: ${item.amount.toLocaleString()}`, legendX + 20, legendY + 11);
    
    legendX += 180;
  });
  
  return canvas.toDataURL('image/png');
};

export const createRecipientsAreaChart = (recipientsData: any[]): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 550;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
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
    ctx.fillStyle = item.color + '60';
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    
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
    
    ctx.lineTo(startX + xOffset + areaWidth, startY + chartHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Add value label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    const labelX = startX + xOffset + areaWidth / 2;
    ctx.fillText(item.value.toString(), labelX, startY + chartHeight - areaHeight - 10);
    
    ctx.font = '10px Arial';
    const name = item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name;
    ctx.fillText(name, labelX, startY + chartHeight + 15);
  });
  
  return canvas.toDataURL('image/png');
};

export const createFeeTaxPieChart = (feeTaxData: any[], mainCurrency: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 550;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = 275;
  const centerY = 150;
  const radius = 100;
  
  let total = feeTaxData.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;
  
  feeTaxData.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, item.color + 'FF');
    gradient.addColorStop(1, item.color + '80');
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Add text
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
  
  // Add legend
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
  
  return canvas.toDataURL('image/png');
};
