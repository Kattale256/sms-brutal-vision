
import React from 'react';

const ChatLoadingIndicator: React.FC = () => {
  return (
    <div className="ml-2 mr-auto mb-4">
      <div className="inline-block p-4 rounded-lg bg-silver-light border-2 border-neo-black">
        <div className="flex space-x-2 items-center">
          <div className="w-3 h-3 rounded-full bg-neo-yellow animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-neo-yellow animate-pulse" style={{
            animationDelay: '0.2s'
          }}></div>
          <div className="w-3 h-3 rounded-full bg-neo-yellow animate-pulse" style={{
            animationDelay: '0.4s'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingIndicator;
