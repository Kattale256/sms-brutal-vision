
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
      // Fix the Plugins access
      if (!Capacitor.Plugins) {
        console.log("Permissions plugin not available");
        return false;
      }
      
      const { Permissions } = Capacitor.Plugins;
      
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
          // Fix the Plugins access
          if (!Capacitor.Plugins) {
            console.log("Plugins not available");
            return [];
          }
          
          const { SmsReader } = Capacitor.Plugins;
          
          if (SmsReader) {
            const result = await SmsReader.getSmsMessages({
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
    // Split text by multiple messages - adapted for Airtel format which may be concatenated
    const messages = text.split(/(?=SENT|RECEIVED|PAID|You have sent|You have received)/i).filter(msg => msg.trim().length > 0);
    
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
    
    // Identify transaction type - updated for Airtel format
    let type: Transaction['type'] = 'other';
    if (lowerMessage.includes('sent') || lowerMessage.includes('send')) {
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
    
    // Extract amount using regex - updated for Airtel format (UGX X,XXX)
    const amountRegex = /(?:UGX|USH|KES|TZS)\s*([0-9,]+(?:\.[0-9]+)?)/i;
    const amountMatch = message.match(amountRegex);
    
    if (!amountMatch) {
      console.log("Could not extract amount from message:", message);
      return null;
    }
    
    const amountStr = amountMatch[1].replace(/,/g, '');
    const amount = parseFloat(amountStr);
    
    // Extract currency - updated for East African currencies
    let currency = 'UGX'; // Default for Uganda
    if (message.includes('UGX')) {
      currency = 'UGX';
    } else if (message.includes('KES')) {
      currency = 'KES';
    } else if (message.includes('TZS')) {
      currency = 'TZS';
    }
    
    // Extract recipient - updated for Airtel format (to NAME on PHONENUMBER)
    let recipient;
    const recipientRegex = /to\s+([^\.]+?)\s+on\s+(\d+)/i;
    const recipientMatch = message.match(recipientRegex);
    if (recipientMatch) {
      recipient = recipientMatch[1];
    }
    
    // Extract phone number
    const phoneRegex = /on\s+(\d+)/i;
    const phoneMatch = message.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[1] : undefined;
    
    // Extract fee - updated for Airtel format (Fee UGX X.X)
    const feeRegex = /Fee\s+(?:UGX|USH|KES|TZS)\s*([0-9,]+(?:\.[0-9]+)?)/i;
    const feeMatch = message.match(feeRegex);
    const fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : undefined;
    
    // Extract balance - updated for Airtel format (Bal UGX X,XXX)
    const balanceRegex = /Bal\s+(?:UGX|USH|KES|TZS)\s*([0-9,]+(?:\.[0-9]+)?)/i;
    const balanceMatch = message.match(balanceRegex);
    const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : undefined;
    
    // Extract reference - updated for Airtel format (TID XXXXXXXXX)
    const referenceRegex = /TID\s+([0-9]+)/i;
    const referenceMatch = message.match(referenceRegex);
    const reference = referenceMatch ? referenceMatch[1] : undefined;
    
    // Use current timestamp as we don't have date in the sample message
    const timestamp = new Date().toISOString();
    
    return {
      id,
      type,
      amount,
      currency,
      recipient,
      sender: undefined, // Not available in the provided format
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
        sender: 'Airtel Money',
        content: 'SENT UGX 4,000 to KASUBO DEBORAH PRISCILLA on 256780536411. Fee UGX 100.0 Bal UGX 93,042. TID 121346546521. Send using MyAirtel App https://bit.ly/3ZgpiNw',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '2',
        sender: 'Airtel Money',
        content: 'SENT UGX 4,000 to KASUBO DEBORAH PRISCILLA on 256780536411. Fee UGX 100.0 Bal UGX 97,142. TID 121346498791. Send using MyAirtel App https://bit.ly/3ZgpiNw',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '3',
        sender: 'Airtel Money',
        content: 'SENT UGX 4,000 to KASUBO DEBORAH PRISCILLA on 256780536411. Fee UGX 100.0 Bal UGX 101,242. TID 121346442636. Send using MyAirtel App https://bit.ly/3ZgpiNw',
        timestamp: new Date().toISOString(),
        category: 'finance'
      }
    ];
  }
}

export default SmsReader;
