
import React from 'react';

interface CustomBubbleDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    radius: number;
    color: string;
    name: string;
    value: number;
  };
  isMobile: boolean;
  onBubbleClick: (data: any) => void;
}

export const CustomBubbleDot: React.FC<CustomBubbleDotProps> = ({ 
  cx, 
  cy, 
  payload, 
  isMobile, 
  onBubbleClick 
}) => {
  if (!payload || cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.radius}
      fill={payload.color}
      stroke="#1A1F2C"
      strokeWidth={isMobile ? 1 : 2}
      style={{ cursor: 'pointer' }}
      onClick={() => onBubbleClick(payload)}
    />
  );
};
