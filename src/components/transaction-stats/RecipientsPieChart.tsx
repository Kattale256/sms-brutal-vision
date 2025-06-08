
import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getFrequentContacts } from '../../utils/transactionAnalyzer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface RecipientsPieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF5722', '#795548', '#607D8B'];

const RecipientsPieChart: React.FC<RecipientsPieChartProps> = ({ transactions }) => {
  const [selectedBubble, setSelectedBubble] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const frequentContacts = getFrequentContacts(transactions);
  
  const bubbleData = Object.entries(frequentContacts)
    .slice(0, 8) // Show more contacts in bubble format
    .map(([name, count], index) => ({
      name: name || 'Unknown',
      value: count,
      size: Math.max(count * 10, 30), // Dynamic bubble size
      color: COLORS[index % COLORS.length],
      x: Math.random() * 80 + 10, // Random positioning
      y: Math.random() * 80 + 10
    }));

  const handleBubbleClick = (data: any) => {
    setSelectedBubble(data);
    setDialogOpen(true);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-neo-black p-2 rounded shadow-neo">
          <p className="font-bold">{data.name}</p>
          <p>{data.value} transactions</p>
        </div>
      );
    }
    return null;
  };
    
  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">RECIPIENTS BUBBLE CHART</h2>
      {bubbleData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
                    strokeWidth={2}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-neo-gray">
          No recipient data available
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedBubble && (
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{selectedBubble.name}</h3>
              <p className="text-lg">Total Transactions: <span className="font-bold">{selectedBubble.value}</span></p>
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">
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
