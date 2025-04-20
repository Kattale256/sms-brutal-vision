
import React, { useEffect, useState } from 'react';

interface VisitorStatsProps {
  exportCount: number;
}

const VisitorStats: React.FC<VisitorStatsProps> = ({ exportCount }) => {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  
  useEffect(() => {
    // Get visitor count from localStorage or default to a random number between 1000-5000
    const storedCount = localStorage.getItem('visitorCount');
    if (storedCount) {
      setVisitorCount(parseInt(storedCount, 10));
    } else {
      const initialCount = Math.floor(Math.random() * 4000) + 1000;
      setVisitorCount(initialCount);
      localStorage.setItem('visitorCount', initialCount.toString());
    }
    
    // Simulate visitor count incrementing occasionally
    const interval = setInterval(() => {
      setVisitorCount(prevCount => {
        const newCount = prevCount + 1;
        localStorage.setItem('visitorCount', newCount.toString());
        return newCount;
      });
    }, Math.random() * 30000 + 10000); // Random interval between 10-40 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="neo-chart">
        <h2 className="text-2xl font-bold mb-4">VISITOR STATISTICS</h2>
        <div className="p-6 flex flex-col items-center justify-center h-[200px]">
          <div className="text-5xl font-bold">{visitorCount.toLocaleString()}</div>
          <div className="text-xl mt-4">Total App Visitors</div>
        </div>
      </div>
      
      <div className="neo-chart">
        <h2 className="text-2xl font-bold mb-4">EXPORT STATISTICS</h2>
        <div className="p-6 flex flex-col items-center justify-center h-[200px]">
          <div className="text-5xl font-bold">{exportCount.toLocaleString()}</div>
          <div className="text-xl mt-4">Total Exports Generated</div>
        </div>
      </div>
    </div>
  );
};

export default VisitorStats;
