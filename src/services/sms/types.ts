
export interface SmsMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  category?: string;
}

export interface Transaction {
  id: string;
  type: 'receive' | 'send' | 'payment' | 'withdrawal' | 'deposit';
  amount: number;
  currency: string;
  sender?: string;
  recipient?: string;
  fee?: number;
  tax?: number;
  balance?: number;
  reference?: string;
  timestamp: string;
  agentId?: string;
  phoneNumber?: string;
}
