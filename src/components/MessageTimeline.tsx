
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SmsMessage } from '../data/sampleData';
import { getMessagesTimeline } from '../utils/smsAnalyzer';

interface MessageTimelineProps {
  messages: SmsMessage[];
}

const MessageTimeline: React.FC<MessageTimelineProps> = ({ messages }) => {
  const timelineData = getMessagesTimeline(messages);
  
  const chartData = Object.entries(timelineData).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count
  }));

  return (
    <div className="neo-chart mt-6">
      <h2 className="text-2xl font-bold mb-4">MESSAGE ACTIVITY TIMELINE</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="date" stroke="#1A1F2C" />
          <YAxis stroke="#1A1F2C" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '2px solid #1A1F2C',
              borderRadius: '0px'
            }}
            itemStyle={{ color: '#1A1F2C' }}
            labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#1A1F2C" 
            strokeWidth={3}
            dot={{ stroke: '#1A1F2C', strokeWidth: 2, fill: '#FF5252', r: 5 }}
            activeDot={{ stroke: '#1A1F2C', strokeWidth: 2, fill: '#FFD600', r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MessageTimeline;
