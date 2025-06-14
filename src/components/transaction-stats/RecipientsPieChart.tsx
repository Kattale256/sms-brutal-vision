
import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getFrequentContacts } from '../../utils/transactionAnalyzer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useIsMobile } from '../../hooks/use-mobile';

interface RecipientsPieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF5722', '#795548', '#607D8B'];

const RecipientsPieChart: React.FC<RecipientsPieChartProps> = ({ transactions }) => {
  const [selectedBubble, setSelectedBubble] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const frequentContacts = getFrequentContacts(transactions);
  
  // Calculate bubble sizes with proper scaling
  const contactEntries = Object.entries(frequentContacts).slice(0, 9);
  const transactionCounts = contactEntries.map(([, count]) => count);
  const maxTransactions = Math.max(...transactionCounts);
  const minTransactions = Math.min(...transactionCounts);
  
  // Non-overlapping positioning algorithm
  const generateNonOverlappingPositions = (bubbles: any[]) => {
    const positions: { x: number; y: number; radius: number }[] = [];
    const maxAttempts = 100;
    const padding = 5; // Minimum distance between bubble edges
    
    bubbles.forEach((bubble, index) => {
      let positioned = false;
      let attempts = 0;
      
      while (!positioned && attempts < maxAttempts) {
        let x, y;
        
        if (index === 0) {
          // Place first bubble in center
          x = 50;
          y = 50;
        } else {
          // Generate random position within bounds
          const margin = bubble.radius + 10;
          x = margin + Math.random() * (100 - 2 * margin);
          y = margin + Math.random() * (100 - 2 * margin);
        }
        
        // Check for overlaps with existing bubbles
        let hasOverlap = false;
        for (const existing of positions) {
          const distance = Math.sqrt(Math.pow(x - existing.x, 2) + Math.pow(y - existing.y, 2));
          const minDistance = bubble.radius + existing.radius + padding;
          
          if (distance < minDistance) {
            hasOverlap = true;
            break;
          }
        }
        
        if (!hasOverlap) {
          positions.push({ x, y, radius: bubble.radius });
          bubble.x = x;
          bubble.y = y;
          positioned = true;
        }
        
        attempts++;
      }
      
      // If we couldn't find a non-overlapping position, use a fallback grid position
      if (!positioned) {
        const gridSize = Math.ceil(Math.sqrt(bubbles.length));
        const gridX = (index % gridSize) * (100 / gridSize) + (50 / gridSize);
        const gridY = Math.floor(index / gridSize) * (100 / gridSize) + (50 / gridSize);
        
        bubble.x = Math.max(bubble.radius, Math.min(100 - bubble.radius, gridX));
        bubble.y = Math.max(bubble.radius, Math.min(100 - bubble.radius, gridY));
        positions.push({ x: bubble.x, y: bubble.y, radius: bubble.radius });
      }
    });
    
    return bubbles;
  };
  
  const bubbleData = contactEntries.map(([name, count], index) => {
    // Calculate bubble size with much more pronounced scaling
    const baseSize = isMobile ? 8 : 12;
    const maxSize = isMobile ? 45 : 60;
    
    let bubbleSize;
    if (maxTransactions === minTransactions) {
      bubbleSize = (baseSize + maxSize) / 2;
    } else {
      // Use linear scaling for more dramatic size differences
      const ratio = (count - minTransactions) / (maxTransactions - minTransactions);
      bubbleSize = baseSize + (ratio * (maxSize - baseSize));
    }
    
    return {
      name: name || 'Unknown',
      value: count,
      size: bubbleSize,
      radius: bubbleSize / 2,
      color: COLORS[index % COLORS.length],
      x: 0, // Will be set by positioning algorithm
      y: 0  // Will be set by positioning algorithm
    };
  });

  // Apply non-overlapping positioning
  const positionedBubbles = generateNonOverlappingPositions(bubbleData);

  const handleBubbleClick = (data: any) => {
    setSelectedBubble(data);
    setDialogOpen(true);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-neo-black p-2 rounded shadow-neo text-xs sm:text-sm">
          <p className="font-bold">{data.name}</p>
          <p>{data.value} transactions</p>
          <p className="text-xs text-gray-500">Click to view details</p>
        </div>
      );
    }
    return null;
  };

  // Custom dot component to render bubbles with proper sizing
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={payload.radius}
        fill={payload.color}
        stroke="#1A1F2C"
        strokeWidth={isMobile ? 1 : 2}
        style={{ cursor: 'pointer' }}
        onClick={() => handleBubbleClick(payload)}
      />
    );
  };
    
  return (
    <div className="neo-chart">
      <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">RECIPIENTS BUBBLE CHART</h2>
      {positionedBubbles.length > 0 ? (
        <div className="h-[280px] sm:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ 
              top: isMobile ? 20 : 30, 
              right: isMobile ? 20 : 30, 
              bottom: isMobile ? 20 : 30, 
              left: isMobile ? 20 : 30 
            }}>
              <XAxis 
                type="number" 
                dataKey="x" 
                domain={[0, 100]} 
                hide 
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                domain={[0, 100]} 
                hide 
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                data={positionedBubbles} 
                fill="#8884d8"
                shape={<CustomDot />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[280px] sm:h-[350px] flex items-center justify-center text-neo-gray text-sm">
          No recipient data available
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Contact Details</DialogTitle>
          </DialogHeader>
          {selectedBubble && (
            <div className="p-2 sm:p-4">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{selectedBubble.name}</h3>
              <p className="text-sm sm:text-lg">Total Transactions: <span className="font-bold">{selectedBubble.value}</span></p>
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded border">
                <p className="text-xs sm:text-sm text-gray-600">
                  This contact appears in {selectedBubble.value} of your transactions, 
                  making them one of your most frequent contacts.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipientsPieChart;
