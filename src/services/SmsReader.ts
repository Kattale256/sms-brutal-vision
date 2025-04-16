
import { Capacitor } from "@capacitor/core";

export interface SmsMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  category?: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'payment' | 'withdrawal' | 'deposit' | 'other';
  amount: number;
  currency: string;
  sender?: string;
  recipient?: string;
  fee?: number;
  balance?: number;
  reference?: string;
  timestamp: string;
}

class SmsReader {
  private static instance: SmsReader;
  private hasPermission: boolean = false;

  private constructor() {}

  public static getInstance(): SmsReader {
    if (!SmsReader.instance) {
      SmsReader.instance = new SmsReader();
    }
    return SmsReader.instance;
  }

  public isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  public async requestSmsPermission(): Promise<boolean> {
    if (!this.isNativePlatform()) {
      console.log("Not on a native platform");
      return false;
    }

    try {
      const { Permissions } = Capacitor.Plugins || {};
      
      if (!Permissions) {
        console.log("Permissions plugin not available");
        return false;
      }
      
      const permissionStatus = await Permissions.query({ name: 'sms' });
      
      if (permissionStatus.state === 'granted') {
        this.hasPermission = true;
        return true;
      }
      
      if (permissionStatus.state === 'prompt') {
        const requestResult = await Permissions.request({ name: 'sms' });
        this.hasPermission = requestResult.state === 'granted';
        return this.hasPermission;
      }
      
      console.log("SMS permission denied");
      return false;
    } catch (error) {
      console.error("Error requesting SMS permission:", error);
      return false;
    }
  }

  public async readSms(): Promise<SmsMessage[]> {
    if (!this.isNativePlatform() || !this.hasPermission) {
      console.log("Cannot read SMS: not on native platform or no permission");
      return [];
    }

    try {
      console.log("Reading SMS using ContentProvider");
      
      if (Capacitor.isPluginAvailable && Capacitor.isPluginAvailable('SmsReader')) {
        console.log("SmsReader plugin is available");
        
        try {
          const plugins = Capacitor.Plugins || {};
          if (plugins.SmsReader) {
            const result = await plugins.SmsReader.getSmsMessages({
              maxCount: 100,
              contentUri: "content://sms/inbox"
            });
            
            if (result && result.messages) {
              console.log(`Successfully read ${result.messages.length} SMS messages`);
              return this.formatSmsMessages(result.messages);
            }
          }
        } catch (pluginError) {
          console.error("Error calling SmsReader plugin:", pluginError);
        }
      } else {
        console.log("SmsReader plugin is not available, native implementation required");
      }
      
      console.log("Returning sample data instead");
      return this.getSampleData();
    } catch (error) {
      console.error("Error reading SMS:", error);
      return this.getSampleData();
    }
  }

  public parseTransactionsFromText(text: string): Transaction[] {
    // Split text by new lines in case multiple messages were pasted
    const messages = text.split(/\n\n+/).filter(msg => msg.trim().length > 0);
    
    console.log(`Parsing ${messages.length} messages`);
    
    const transactions: Transaction[] = [];
    
    messages.forEach((message, index) => {
      const transaction = this.parseTransactionMessage(message, index.toString());
      if (transaction) {
        transactions.push(transaction);
      }
    });
    
    console.log(`Extracted ${transactions.length} transactions`);
    return transactions;
  }

  private parseTransactionMessage(message: string, id: string): Transaction | null {
    // Convert to lowercase for easier pattern matching
    const lowerMessage = message.toLowerCase();
    
    // Identify transaction type
    let type: Transaction['type'] = 'other';
    if (lowerMessage.includes('sent') || lowerMessage.includes('send') || lowerMessage.includes('transferred')) {
      type = 'send';
    } else if (lowerMessage.includes('received') || lowerMessage.includes('receive')) {
      type = 'receive';
    } else if (lowerMessage.includes('paid') || lowerMessage.includes('payment')) {
      type = 'payment';
    } else if (lowerMessage.includes('withdraw')) {
      type = 'withdrawal';
    } else if (lowerMessage.includes('deposit')) {
      type = 'deposit';
    }
    
    // Extract amount using regex
    // Look for currency symbols or codes followed by numbers
    const amountRegex = /(?:[$£€]|USD|EUR|GBP)\s*([0-9,.]+)|([0-9,.]+)\s*(?:[$£€]|USD|EUR|GBP)/i;
    const amountMatch = message.match(amountRegex);
    
    if (!amountMatch) {
      console.log("Could not extract amount from message");
      return null;
    }
    
    const amountStr = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
    const amount = parseFloat(amountStr);
    
    // Extract currency
    let currency = 'USD'; // Default
    if (message.includes('$') || message.includes('USD')) {
      currency = 'USD';
    } else if (message.includes('€') || message.includes('EUR')) {
      currency = 'EUR';
    } else if (message.includes('£') || message.includes('GBP')) {
      currency = 'GBP';
    }
    
    // Extract sender/recipient using regex for names or phone numbers
    const phoneRegex = /[+]?[\d]{10,15}/g;
    const phoneMatches = message.match(phoneRegex);
    
    // Extract reference
    const referenceRegex = /ref(?:erence)?:?\s*([A-Z0-9]+)/i;
    const referenceMatch = message.match(referenceRegex);
    const reference = referenceMatch ? referenceMatch[1] : undefined;
    
    // Extract balance - common pattern: "Balance: $X" or "New Balance: $X"
    const balanceRegex = /(?:new\s+)?balance:?\s*(?:[$£€]|USD|EUR|GBP)?\s*([0-9,.]+)/i;
    const balanceMatch = message.match(balanceRegex);
    const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : undefined;
    
    // Extract fee - common pattern: "Fee: $X"
    const feeRegex = /fee:?\s*(?:[$£€]|USD|EUR|GBP)?\s*([0-9,.]+)/i;
    const feeMatch = message.match(feeRegex);
    const fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : undefined;
    
    // Extract date from the message
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|\d{1,2} [A-Za-z]{3} \d{2,4})/i;
    const dateMatch = message.match(dateRegex);
    
    // Extract time from the message
    const timeRegex = /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i;
    const timeMatch = message.match(timeRegex);
    
    // Combine date and time if available, or use current date
    let timestamp;
    if (dateMatch && timeMatch) {
      timestamp = new Date(`${dateMatch[1]} ${timeMatch[1]}`).toISOString();
    } else if (dateMatch) {
      timestamp = new Date(dateMatch[1]).toISOString();
    } else {
      timestamp = new Date().toISOString();
    }
    
    return {
      id,
      type,
      amount,
      currency,
      sender: type === 'receive' && phoneMatches ? phoneMatches[0] : undefined,
      recipient: type === 'send' && phoneMatches ? phoneMatches[0] : undefined,
      fee,
      balance,
      reference,
      timestamp
    };
  }

  private formatSmsMessages(nativeMessages: any[]): SmsMessage[] {
    return nativeMessages.map((msg, index) => ({
      id: msg.id || String(index),
      sender: msg.address || msg.sender || 'Unknown',
      content: msg.body || msg.content || '',
      timestamp: msg.date ? new Date(msg.date).toISOString() : new Date().toISOString(),
      category: undefined
    }));
  }

  private getSampleData(): SmsMessage[] {
    return [
      {
        id: '1',
        sender: 'MPESA',
        content: 'Transaction confirmed. You have sent $100.00 to John Doe on 12/04/2023 at 14:35. Transaction fee: $0.50. Your new balance is $1,245.60. Reference: TX789012.',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '2',
        sender: 'MobileMoney',
        content: 'You have received $75.25 from Jane Smith. Your new balance is $1,320.85. Reference: RX567890. Transaction completed on 12/04/2023 at 15:40.',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '3',
        sender: 'PayService',
        content: 'Payment of $32.40 to ACME Store completed. Fee: $0.30. Balance: $1,288.15. Date: 12/04/2023, Time: 16:20. Ref: PS123456',
        timestamp: new Date().toISOString(),
        category: 'finance'
      }
    ];
  }
}

export default SmsReader;
