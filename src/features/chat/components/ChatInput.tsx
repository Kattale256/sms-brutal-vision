
import React from 'react';
import { ChatInputProps } from '../types';
import { SendHorizontal } from 'lucide-react';

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSubmit, isProcessing }) => {
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question about your transactions..."
        className="w-full p-3 border-2 border-neo-black rounded-md pr-12"
        disabled={isProcessing}
      />
      <button
        type="submit"
        className={`absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center ${
          isProcessing ? 'opacity-50' : 'hover:bg-gray-100'
        }`}
        disabled={isProcessing}
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;
