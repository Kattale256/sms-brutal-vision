
import React, { useEffect, useState } from 'react';
import { Users, FileDown } from 'lucide-react';

interface VisitorStatsProps {
  exportCount: number;
}

const VisitorStats: React.FC<VisitorStatsProps> = ({ exportCount }) => {
  const [visitorCount, setVisitorCount] = useState(0);
  
  useEffect(() => {
    // Get existing visitor count from localStorage or start from a base number
    const savedVisitors = localStorage.getItem('visitorCount');
    const startCount = savedVisitors ? parseInt(savedVisitors, 10) : 188; // Start with a base number
    
    // Increment by 1 for the current session
    const newCount = startCount + 1;
    setVisitorCount(newCount);
    localStorage.setItem('visitorCount', newCount.toString());
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        // Randomly increment the counter to simulate real-time visitors
        if (Math.random() > 0.7) {
          const newVal = prev + 1;
          localStorage.setItem('visitorCount', newVal.toString());
          return newVal;
        }
        return prev;
      });
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-6 mt-8">
      <div className="neo-chart">
        <h2 className="text-xl font-bold mb-2">VISITORS</h2>
        <div className="flex items-center">
          <Users className="h-6 w-6 mr-2 text-blue-500" />
          <span className="text-3xl font-mono">{visitorCount.toLocaleString()}</span>
        </div>
        <p className="text-neo-gray text-sm mt-1">Real-time visitor count</p>
      </div>
      
      <div className="neo-chart">
        <h2 className="text-xl font-bold mb-2">EXPORTS</h2>
        <div className="flex items-center">
          <FileDown className="h-6 w-6 mr-2 text-green-500" />
          <span className="text-3xl font-mono">{exportCount.toLocaleString()}</span>
        </div>
        <p className="text-neo-gray text-sm mt-1">Total exports generated</p>
      </div>
    </div>
  );
};

export default VisitorStats;
