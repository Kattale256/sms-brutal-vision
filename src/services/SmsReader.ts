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
      const permissions = Capacitor.Permissions;
      
      if (!permissions) {
        console.log("Permissions plugin not available");
        return false;
      }
      
      const permissionStatus = await permissions.query({ name: 'sms' });
      
      if (permissionStatus.state === 'granted') {
        this.hasPermission = true;
        return true;
      }
      
      if (permissionStatus.state === 'prompt') {
        const requestResult = await permissions.request({ name: 'sms' });
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
      return this.getSampleData();
    }

    try {
      console.log("Reading SMS using ContentProvider");
      
      const isAvailable = Capacitor.isPluginAvailable('SmsReader');
      if (isAvailable) {
        console.log("SmsReader plugin is available");
        
        try {
          const smsReader = Capacitor.Plugins.SmsReader;
          
          if (smsReader) {
            const result = await smsReader.getSmsMessages({
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
    const messages = text.split(/(?=SENT|RECEIVED|PAID|WITHDRAWN|You have sent|You have received)/i)
      .filter(msg => msg.trim().length > 0);
    
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
    const lowerMessage = message.toLowerCase();
    
    let type: Transaction['type'] = 'send';
    
    // Determine transaction type
    if (lowerMessage.includes('received')) {
      type = 'receive';
    } else if (lowerMessage.includes('sent')) {
      type = 'send';
    } else if (lowerMessage.includes('paid')) {
      type = 'payment';
    } else if (lowerMessage.includes('withdrawn')) {
      type = 'withdrawal';
    } else if (lowerMessage.includes('cash deposit')) {
      type = 'deposit';
    }
    
    // Extract TID (Transaction ID)
    const tidRegex = /TID\s+(\d+)/i;
    const tidMatch = message.match(tidRegex);
    const reference = tidMatch ? tidMatch[1] : undefined;
    
    if (!reference) {
      console.log("Could not extract TID from message:", message);
      return null;
    }
    
    // Extract amount
    const amountRegex = /UGX\s*([0-9,.]+)/i;
    const amountMatch = message.match(amountRegex);
    
    if (!amountMatch) {
      console.log("Could not extract amount from message:", message);
      return null;
    }
    
    const amountStr = amountMatch[1].replace(/,/g, '');
    const amount = parseFloat(amountStr);
    const currency = 'UGX';
    
    let sender: string | undefined;
    let recipient: string | undefined;
    let fee: number | undefined;
    let tax: number | undefined;
    let agentId: string | undefined;
    let phoneNumber: string | undefined;
    let timestamp = new Date().toISOString();
    
    // Parse transaction-specific details
    if (type === 'receive') {
      // Format: "from 755352144, GODFREY MUYIMBWA"
      const phoneRegex = /from\s+(\d{9})/i;
      const phoneMatch = message.match(phoneRegex);
      phoneNumber = phoneMatch ? phoneMatch[1] : undefined;
      
      const nameRegex = /from\s+\d{9},\s+([^\.]+)/i;
      const nameMatch = message.match(nameRegex);
      sender = nameMatch ? nameMatch[1].trim() : undefined;
    } 
    else if (type === 'send') {
      // Handle sent transaction
      const recipientRegex = /to\s+([^\d]+)\s+\d{9}/i;
      const recipientMatch = message.match(recipientRegex);
      recipient = recipientMatch ? recipientMatch[1].trim() : undefined;
      
      const phoneRegex = /\s(\d{9})/i;
      const phoneMatch = message.match(phoneRegex);
      phoneNumber = phoneMatch ? phoneMatch[1] : undefined;
      
      const feeRegex = /Fee\s+UGX\s*([0-9,]+(?:\.[0-9]+)?)/i;
      const feeMatch = message.match(feeRegex);
      fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : undefined;
      
      const dateTimeRegex = /(\d{1,2}-[A-Za-z]+-\d{4}\s+\d{1,2}:\d{2})/i;
      const dateTimeMatch = message.match(dateTimeRegex);
      if (dateTimeMatch) {
        const dateStr = dateTimeMatch[1];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.toISOString();
        }
      }
    } 
    else if (type === 'withdrawal') {
      const agentRegex = /Agent ID:\s+(\d+)/i;
      const agentMatch = message.match(agentRegex);
      agentId = agentMatch ? agentMatch[1] : undefined;
      
      const feeRegex = /Fee\s+UGX\s*([0-9,]+(?:\.[0-9]+)?)/i;
      const feeMatch = message.match(feeRegex);
      fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : undefined;
      
      const taxRegex = /Tax\s+UGX\s*([0-9,]+(?:\.[0-9]+)?)/i;
      const taxMatch = message.match(taxRegex);
      tax = taxMatch ? parseFloat(taxMatch[1].replace(/,/g, '')) : undefined;
      
      const dateTimeRegex = /(\d{1,2}-[A-Za-z]+-\d{4}\s+\d{1,2}:\d{2})/i;
      const dateTimeMatch = message.match(dateTimeRegex);
      if (dateTimeMatch) {
        const dateStr = dateTimeMatch[1];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.toISOString();
        }
      }
    } 
    else if (type === 'payment') {
      const businessRegex = /to\s+([^\.\d]+)/i;
      const businessMatch = message.match(businessRegex);
      recipient = businessMatch ? businessMatch[1].trim() : undefined;
      
      const chargeRegex = /Charge\s+UGX\s*([0-9,]+(?:\.[0-9]+)?)/i;
      const chargeMatch = message.match(chargeRegex);
      fee = chargeMatch ? parseFloat(chargeMatch[1].replace(/,/g, '')) : undefined;
      
      const dateTimeRegex = /(\d{1,2}-[A-Za-z]+-\d{4}\s+\d{1,2}:\d{2})/i;
      const dateTimeMatch = message.match(dateTimeRegex);
      if (dateTimeMatch) {
        const dateStr = dateTimeMatch[1];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.toISOString();
        }
      }
    }
    else if (type === 'deposit') {
      const agentRegex = /Agent ID:\s+(\d+)/i;
      const agentMatch = message.match(agentRegex);
      agentId = agentMatch ? agentMatch[1] : undefined;
      
      const dateTimeRegex = /(\d{1,2}-[A-Za-z]+-\d{4}\s+\d{1,2}:\d{2})/i;
      const dateTimeMatch = message.match(dateTimeRegex);
      if (dateTimeMatch) {
        const dateStr = dateTimeMatch[1];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.toISOString();
        }
      }
    }
    
    return {
      id,
      type,
      amount,
      currency,
      sender,
      recipient,
      fee,
      tax,
      reference,
      agentId,
      phoneNumber,
      timestamp
    };
  }

  private formatSmsMessages(nativeMessages: any[]): SmsMessage[] {
    return [];
  }

  private getSampleData(): SmsMessage[] {
    return [
      {
        id: '1',
        sender: 'Airtel Money',
        content: 'RECEIVED. TID 121327207176. UGX 103,000 from 755352144, GODFREY MUYIMBWA. Bal UGX 105,342. View txns on MyAirtel App https://bit.ly/3ZgpiNw',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '2',
        sender: 'Airtel Money',
        content: 'SENT.TID 121276773406. UGX 4,000 to KASUBO PRISCILLADEBORAH 0755897066. Fee UGX 100. Bal UGX 31,522. Date 13-April-2025 12:14.',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '3',
        sender: 'Airtel Money',
        content: 'WITHDRAWN. TID 121246397487. UGX20,000 with Agent ID: 256593.Fee UGX 880. Bal UGX 35,622. 12-April-2025 19:55.Tax UGX 100',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      {
        id: '4',
        sender: 'Airtel Money',
        content: 'PAID.TID 121158749528. UGX 10,000 to BUSINESS Charge UGX 0. Bal UGX 56,602. 11-April-2025 13:05',
        timestamp: new Date().toISOString(),
        category: 'finance'
      }
    ];
  }
}

export default SmsReader;
