
import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip } from 'recharts';
import { Transaction } from '../../services/sms/types';
import { useIsMobile } from '../../hooks/use-mobile';
import { BubblePositioning } from './recipients-chart/BubblePositioning';
import { BubbleDataProcessor } from './recipients-chart/BubbleDataProcessor';
import { BubbleTooltip } from './recipients-chart/BubbleTooltip';
import { CustomBubbleDot } from './recipients-chart/CustomBubbleDot';
import { ContactDetailsDialog } from './recipients-chart/ContactDetailsDialog';

interface RecipientsPieChartProps {
  transactions: Transaction[];
}

const RecipientsPieChart: React.FC<RecipientsPieChartProps> = ({ transactions }) => {
  const [selectedBubble, setSelectedBubble] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const bubbleData = BubbleDataProcessor.processBubbleData(transactions, isMobile);
  
  // Apply positioning algorithm
  const bubblePositioning = new BubblePositioning(isMobile);
  const positionedBubbles = bubblePositioning.generateNonOverlappingPositions(bubbleData);

  const handleBubbleClick = (data: any) => {
    setSelectedBubble(data);
    setDialogOpen(true);
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
              <Tooltip content={<BubbleTooltip />} />
              <Scatter 
                data={positionedBubbles} 
                fill="#8884d8"
                shape={<CustomBubbleDot isMobile={isMobile} onBubbleClick={handleBubbleClick} />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[280px] sm:h-[350px] flex items-center justify-center text-neo-gray text-sm">
          No recipient data available
        </div>
      )}
      
      <ContactDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedBubble={selectedBubble}
      />
    </div>
  );
};

export default RecipientsPieChart;
