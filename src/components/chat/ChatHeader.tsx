
import React from 'react';
import { Button } from '../ui/button';
import { Download, Trash, MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  onExport: () => void;
  onClear: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onExport, onClear }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        UNCLE T
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onExport} 
          title="Export chat"
          className="h-8 w-8"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onClear} 
          title="Clear chat"
          className="h-8 w-8"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
