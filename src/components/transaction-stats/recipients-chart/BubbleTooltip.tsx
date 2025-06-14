
import React from 'react';

interface BubbleTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const BubbleTooltip: React.FC<BubbleTooltipProps> = ({ active, payload }) => {
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
