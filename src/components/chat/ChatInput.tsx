
import React from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { SendIcon } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  isProcessing: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSubmit, isProcessing }) => {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask questions about your transactions..."
        className="flex-1 resize-none border-2 border-neo-black h-20"
        disabled={isProcessing}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button 
        type="submit" 
        disabled={isProcessing} 
        className="bg-neo-yellow hover:bg-yellow-400 text-neo-black border-2 border-neo-black h-20"
      >
        <SendIcon className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default ChatInput;
