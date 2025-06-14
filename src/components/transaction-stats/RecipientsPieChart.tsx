
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
  
  // Calculate bubble sizes with better scaling
  const contactEntries = Object.entries(frequentContacts).slice(0, 8);
  const maxTransactions = Math.max(...contactEntries.map(([, count]) => count));
  const minTransactions = Math.min(...contactEntries.map(([, count]) => count));
  
  const bubbleData = contactEntries.map(([name, count], index) => {
    // Calculate relative bubble size (30-120 range for better visibility)
    const sizeRange = isMobile ? 80 : 100; // Smaller max size on mobile
    const minSize = isMobile ? 25 : 30;
    const maxSize = minSize + sizeRange;
    
    let bubbleSize;
    if (maxTransactions === minTransactions) {
      bubbleSize = (minSize + maxSize) / 2;
    } else {
      const ratio = (count - minTransactions) / (maxTransactions - minTransactions);
      bubbleSize = minSize + (ratio * sizeRange);
    }
    
    return {
      name: name || 'Unknown',
      value: count,
      size: bubbleSize,
      color: COLORS[index % COLORS.length],
      x: Math.random() * 70 + 15, // Better spread
      y: Math.random() * 70 + 15
    };
  });

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
        </div>
      );
    }
    return null;
  };
    
  return (
    <div className="neo-chart">
      <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">RECIPIENTS BUBBLE CHART</h2>
      {bubbleData.length > 0 ? (
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ 
              top: isMobile ? 10 : 20, 
              right: isMobile ? 10 : 20, 
              bottom: isMobile ? 10 : 20, 
              left: isMobile ? 10 : 20 
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
                data={bubbleData} 
                fill="#8884d8"
                onClick={handleBubbleClick}
                style={{ cursor: 'pointer' }}
              >
                {bubbleData.map((entry, index) => (
                  <Cell 
                    key={`bubble-${index}`} 
                    fill={entry.color}
                    stroke="#1A1F2C" 
                    strokeWidth={isMobile ? 1 : 2}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-neo-gray text-sm">
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
