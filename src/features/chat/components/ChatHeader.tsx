
import React from 'react';
import { ChatHeaderProps } from '../types';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const ChatHeader: React.FC<ChatHeaderProps> = ({ onExport, onClear }) => {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-yellow-400 rounded-t-lg border-b-2 border-neo-black">
      <h2 className="font-bold">Transaction Assistant</h2>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="hover:bg-yellow-500"
          aria-label="Export chat"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="hover:bg-yellow-500"
          aria-label="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
