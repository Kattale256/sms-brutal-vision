
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Helper to generate a unique ID for chat messages
export const generateMessageId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
