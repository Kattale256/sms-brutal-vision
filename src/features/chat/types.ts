
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export type ChatMessageType = ChatMessage;

// Helper to generate a unique ID for chat messages
export const generateMessageId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Define common types used across chat components
export interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e?: React.FormEvent) => void;
  isProcessing: boolean;
}

export interface ChatHeaderProps {
  onExport: () => void;
  onClear: () => void;
}

export interface ChatFAQTabsProps {
  onQuestionClick: (question: string) => void;
}

export interface ChatMessageProps {
  message: ChatMessageType;
}
