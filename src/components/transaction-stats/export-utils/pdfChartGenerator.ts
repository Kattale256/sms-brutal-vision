
import { ChartDataItem } from './prepareChartData';

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

// Create proper stacked area chart for transaction breakdown matching TransactionBreakdown.tsx
export const createTransactionBreakdownChart = (transactions: any[]): string | null => {
  try {
    console.log('Creating transaction breakdown area chart with transactions:', transactions.length);
    
    const canvasResult = createCanvas(800, 400);
    if (!canvasResult) return null;
    
    const { canvas, ctx } = canvasResult;
    
    if (transactions.length === 0) {
      console.error('No transactions provided');
      return null;
    }
    
    // Process transactions by date (same logic as TransactionBreakdown.tsx)
    const transactionsByDate: Record<string, Record<string, number>> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!transactionsByDate[dateKey]) {
        transactionsByDate[dateKey] = {
          send: 0,
          receive: 0,
          payment: 0,
          withdrawal: 0,
          deposit: 0,
          other: 0
        };
      }
      
      // Add transaction amount to appropriate category
      if (transaction.type in transactionsByDate[dateKey]) {
        transactionsByDate[dateKey][transaction.type] += Math.abs(transaction.amount);
      } else {
        transactionsByDate[dateKey].other += Math.abs(transaction.amount);
      }
    });
    
    // Convert to chart data format and sort by date
    const chartData = Object.entries(transactionsByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        ...values
      }));
    
    if (chartData.length === 0) {
      console.error('No chart data generated');
      return null;
    }
    
    // Chart dimensions with proper margins
    const margin = { top: 60, right: 80, bottom: 100, left: 120 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Colors matching TransactionBreakdown.tsx exactly
    const typeColors = {
      send: '#FF6B35', // Bright orange
      receive: '#10B981', // Emerald green
      payment: '#3B82F6', // Blue
      withdrawal: '#8B5CF6', // Purple
      deposit: '#F59E0B', // Amber
      other: '#6B7280' // Gray
    };
    
    // Calculate max value for scaling
    const maxValue = Math.max(...chartData.map(d => 
      Object.keys(typeColors).reduce((sum, type) => sum + (d[type] || 0), 0)
    ));
    
    if (maxValue === 0) {
      console.error('All chart values are zero');
      return null;
    }
    
    const yScale = chartHeight / (maxValue * 1.1); // 10% padding at top
    const xScale = chartWidth / Math.max(1, chartData.length - 1);
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Transaction Breakdown by Type (Area Chart)', canvas.width / 2, 35);
    
    // Create stacked areas (bottom to top)
    const areaTypes = Object.keys(typeColors);
    const areasToShow = areaTypes.filter(type => 
      chartData.some(data => data[type] > 0)
    );
    
    // Draw stacked areas
    areasToShow.forEach((type, typeIndex) => {
      ctx.beginPath();
      
      // Calculate cumulative values for stacking
      chartData.forEach((item, index) => {
        const x = margin.left + (index * xScale);
        
        // Calculate bottom position (sum of all previous areas)
        let bottomValue = 0;
        for (let i = 0; i < typeIndex; i++) {
          bottomValue += item[areasToShow[i]] || 0;
        }
        const bottomY = margin.top + chartHeight - (bottomValue * yScale);
        
        // Calculate top position (bottom + current area)
        const topValue = bottomValue + (item[type] || 0);
        const topY = margin.top + chartHeight - (topValue * yScale);
        
        if (index === 0) {
          ctx.moveTo(x, bottomY);
        } else {
          ctx.lineTo(x, bottomY);
        }
      });
      
      // Draw top line (reverse order)
      for (let index = chartData.length - 1; index >= 0; index--) {
        const x = margin.left + (index * xScale);
        
        let bottomValue = 0;
        for (let i = 0; i < typeIndex; i++) {
          bottomValue += chartData[index][areasToShow[i]] || 0;
        }
        const topValue = bottomValue + (chartData[index][type] || 0);
        const topY = margin.top + chartHeight - (topValue * yScale);
        
        ctx.lineTo(x, topY);
      }
      
      ctx.closePath();
      
      // Fill area with transparency
      ctx.fillStyle = typeColors[type as keyof typeof typeColors] + '80'; // Add alpha
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = typeColors[type as keyof typeof typeColors];
      ctx.lineWidth = 2;
      ctx.stroke();
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
    
    // X-axis labels (dates)
    ctx.textAlign = 'center';
    ctx.font = '9px Arial';
    chartData.forEach((item, index) => {
      if (index % Math.max(1, Math.floor(chartData.length / 8)) === 0) {
        const x = margin.left + (index * xScale);
        ctx.save();
        ctx.translate(x, margin.top + chartHeight + 20);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(item.date, 0, 0);
        ctx.restore();
      }
    });
    
    // Legend
    const legendY = margin.top + chartHeight + 70;
    const legendItemWidth = chartWidth / areasToShow.length;
    
    areasToShow.forEach((type, index) => {
      const x = margin.left + (index * legendItemWidth);
      
      // Legend color box
      ctx.fillStyle = typeColors[type as keyof typeof typeColors];
      ctx.fillRect(x, legendY, 15, 10);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, legendY, 15, 10);
      
      // Legend text
      ctx.fillStyle = '#000000';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(type.charAt(0).toUpperCase() + type.slice(1), x + 20, legendY + 8);
    });
    
    console.log('Transaction breakdown area chart created successfully');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating transaction breakdown area chart:', error);
    return null;
  }
};

// Create optimized pie chart for fees and taxes for PDF documents
export const createFeeTaxPieChart = (feeTaxData: { name: string; value: number }[], currency: string): string | null => {
  try {
    console.log('Creating fee/tax pie chart with data:', feeTaxData);
    
    // Optimized dimensions for PDF documents - wider and better proportioned
    const canvasResult = createCanvas(600, 400);
    if (!canvasResult) return null;
    
    const { canvas, ctx } = canvasResult;
    
    if (feeTaxData.length === 0) {
      console.error('No fee/tax data provided');
      return null;
    }
    
    // Adjusted positioning for better PDF layout
    const centerX = 200; // Move pie chart to left side
    const centerY = 200;
    const radius = 140; // Larger radius for better visibility
    
    const total = feeTaxData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      console.error('Total fee/tax value is zero');
      return null;
    }
    
    let currentAngle = -Math.PI / 2; // Start from top
    
    // Use EXACT colors from TaxesChart.tsx
    const colors: Record<string, string> = {
      'Fees': '#FF5252',
      'Taxes': '#FFC107'
    };
    
    // Draw pie slices
    feeTaxData.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      // Use exact colors from TaxesChart
      ctx.fillStyle = colors[item.name] || '#6B7280';
      ctx.fill();
      
      // Use exact stroke styling from TaxesChart (stroke: '#1A1F2C', strokeWidth: 2)
      ctx.strokeStyle = '#1A1F2C';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // Draw title
    ctx.fillStyle = '#1A1F2C';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FEES & TAXES BREAKDOWN', canvas.width / 2, 30);
    
    // Optimized horizontal legend layout for PDF
    const legendStartX = 380; // Right side of canvas
    const legendStartY = 120;
    
    feeTaxData.forEach((item, index) => {
      const percentage = Math.round((item.value / total) * 100);
      const yOffset = index * 60; // Vertical spacing between legend items
      
      // Draw larger color box for better visibility
      const boxX = legendStartX;
      const boxY = legendStartY + yOffset;
      ctx.fillStyle = colors[item.name] || '#6B7280';
      ctx.fillRect(boxX, boxY, 20, 20);
      ctx.strokeStyle = '#1A1F2C';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, 20, 20);
      
      // Draw text with better formatting
      ctx.fillStyle = '#1A1F2C';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      
      // Item name
      ctx.fillText(item.name, boxX + 30, boxY + 15);
      
      // Amount and percentage on separate line
      ctx.font = '12px Arial';
      ctx.fillText(
        `${item.value.toLocaleString()} ${currency} (${percentage}%)`,
        boxX + 30,
        boxY + 35
      );
    });
    
    // Add summary information
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Total: ${total.toLocaleString()} ${currency}`, legendStartX, legendStartY + (feeTaxData.length * 60) + 20);
    
    console.log('Fee/tax pie chart created successfully with optimized PDF layout');
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating fee/tax pie chart:', error);
    return null;
  }
};
