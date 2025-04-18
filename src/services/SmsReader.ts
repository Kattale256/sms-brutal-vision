
import { Capacitor } from '@capacitor/core';
import { Plugin } from '@capacitor/core';

// Define the SmsPlugin interface
interface SmsPlugin extends Plugin {
  requestPermission(): Promise<{ granted: boolean }>;
  getSms(): Promise<{ messages: string[] }>;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'payment' | 'withdrawal' | 'deposit' | 'other';
  amount: number;
  currency: string;
  timestamp: string;
  sender?: string;
  recipient?: string;
  fee?: number;
  balance?: number;
  reference?: string;
}

class SmsReader {
  private static instance: SmsReader;
  private readonly smsPlugin?: SmsPlugin;

  private constructor() {
    // Only initialize plugin if on native platform
    if (Capacitor.isNativePlatform()) {
      // @ts-ignore - Custom plugin
      this.smsPlugin = Capacitor.Plugins.SmsReader as SmsPlugin;
    }
  }

  static getInstance(): SmsReader {
    if (!SmsReader.instance) {
      SmsReader.instance = new SmsReader();
    }
    return SmsReader.instance;
  }

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  async requestSmsPermission(): Promise<boolean> {
    if (!this.smsPlugin) return false;
    try {
      const { granted } = await this.smsPlugin.requestPermission();
      return granted;
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
      return false;
    }
  }

  async readSms(): Promise<string[]> {
    if (!this.smsPlugin) return [];
    try {
      const { messages } = await this.smsPlugin.getSms();
      return messages;
    } catch (error) {
      console.error('Error reading SMS:', error);
      return [];
    }
  }

  parseTransactionsFromText(text: string): Transaction[] {
    const messages = text.split(/(?=SENT)|(?=RECEIVED)/);
    return messages
      .filter(msg => msg.trim())
      .map(msg => this.parseTransactionMessage(msg.trim()));
  }

  private parseTransactionMessage(message: string): Transaction {
    // Example: "SENT UGX 4,000 to KASUBO DEBORAH PRISCILLA on 256780536411. Fee UGX 100.0 Bal UGX 93,042. TID 121346546521."
    const amountMatch = message.match(/(?:SENT|RECEIVED) UGX ([\d,]+)/);
    const recipientMatch = message.match(/to (.+?) on (\d+)/);
    const feeMatch = message.match(/Fee UGX ([\d,.]+)/);
    const balanceMatch = message.match(/Bal UGX ([\d,]+)/);
    const tidMatch = message.match(/TID (\d+)/);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    const fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : 0;
    const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : undefined;

    return {
      id: tidMatch?.[1] || String(Date.now()),
      type: message.startsWith('SENT') ? 'send' : 'receive',
      amount,
      currency: 'UGX',
      timestamp: new Date().toISOString(),
      recipient: recipientMatch?.[1],
      fee,
      balance,
      reference: tidMatch?.[1],
    };
  }
}

export default SmsReader;

