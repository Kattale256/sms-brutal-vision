
import { Transaction } from './types';

export class MTNParser {
  /**
   * Parse MTN Mobile Money messages into transaction objects
   */
  public parseMTNTransaction(message: string, id: string): Transaction | null {
    const lowerMessage = message.toLowerCase();
    
    // Check if this is an MTN message
    if (!this.isMTNMessage(message)) {
      return null;
    }
    
    let type: Transaction['type'] = 'send';
    let amount = 0;
    let fee: number | undefined;
    let tax: number | undefined;
    let balance: number | undefined;
    let reference: string | undefined;
    let sender: string | undefined;
    let recipient: string | undefined;
    let phoneNumber: string | undefined;
    let timestamp = new Date().toISOString();
    
    // Extract balance (multiple patterns)
    const balanceRegexes = [
      /(?:new balance|balance is now|mobile money balance is now):\s*ugx\s*([0-9,.]+)/i,
      /new balance:\s*ugx\s*([0-9,.]+)/i,
      /balance is:\s*([0-9,.]+)/i
    ];
    
    for (const regex of balanceRegexes) {
      const match = message.match(regex);
      if (match) {
        balance = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }
    
    // Extract transaction ID (multiple patterns)
    const idRegexes = [
      /(?:transaction id|id):\s*(\d+)/i,
      /id:\s*(\d+)/i
    ];
    
    for (const regex of idRegexes) {
      const match = message.match(regex);
      if (match) {
        reference = match[1];
        break;
      }
    }
    
    // Extract timestamp if present
    const timestampRegex = /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/;
    const timestampMatch = message.match(timestampRegex);
    if (timestampMatch) {
      const parsedDate = new Date(timestampMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.toISOString();
      }
    }
    
    // Parse withdrawal messages
    if (lowerMessage.includes('you have withdrawn') || lowerMessage.includes('withdrawn ugx')) {
      type = 'withdrawal';
      
      const amountRegexes = [
        /(?:you have )?withdrawn\s+ugx\s*([0-9,.]+)/i,
        /withdrawn ugx\s*([0-9,.]+)/i
      ];
      
      for (const regex of amountRegexes) {
        const match = message.match(regex);
        if (match) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      const feeRegex = /fee:\s*ugx\s*([0-9,.]+)/i;
      const feeMatch = message.match(feeRegex);
      if (feeMatch) {
        fee = parseFloat(feeMatch[1].replace(/,/g, ''));
      }
      
      const taxRegex = /tax:\s*ugx\s*([0-9,.]+)/i;
      const taxMatch = message.match(taxRegex);
      if (taxMatch) {
        tax = parseFloat(taxMatch[1].replace(/,/g, ''));
      }
    }
    
    // Parse deposit messages
    else if (lowerMessage.includes('you have deposited') || lowerMessage.includes('deposited ugx')) {
      type = 'deposit';
      
      const amountRegexes = [
        /(?:you have )?deposited\s+ugx\s*([0-9,.]+)/i,
        /deposited ugx\s*([0-9,.]+)/i
      ];
      
      for (const regex of amountRegexes) {
        const match = message.match(regex);
        if (match) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      const senderRegex = /from\s+([^0-9]+?)(?:\s+on|\s+\d)/i;
      const senderMatch = message.match(senderRegex);
      if (senderMatch) {
        sender = senderMatch[1].trim();
      }
    }
    
    // Parse payment messages
    else if (lowerMessage.includes('you have paid') || lowerMessage.includes('paid ugx')) {
      type = 'payment';
      
      const amountRegexes = [
        /(?:you have )?paid\s+ugx\s*([0-9,.]+)/i,
        /paid ugx\s*([0-9,.]+)/i
      ];
      
      for (const regex of amountRegexes) {
        const match = message.match(regex);
        if (match) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      const recipientRegex = /to\s+([^0-9]+?)(?:\s+on|\s+\d)/i;
      const recipientMatch = message.match(recipientRegex);
      if (recipientMatch) {
        recipient = recipientMatch[1].trim();
      }
      
      const feeRegex = /fee:\s*ugx\s*([0-9,.]+)/i;
      const feeMatch = message.match(feeRegex);
      if (feeMatch) {
        fee = parseFloat(feeMatch[1].replace(/,/g, ''));
      }
    }
    
    // Parse receive messages
    else if (lowerMessage.includes('you have received') || lowerMessage.includes('received ugx')) {
      type = 'receive';
      
      const amountRegexes = [
        /(?:you have )?received\s+ugx\s*([0-9,.]+)/i,
        /received ugx\s*([0-9,.]+)/i
      ];
      
      for (const regex of amountRegexes) {
        const match = message.match(regex);
        if (match) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      // Handle different sender formats
      const senderRegexes = [
        /from\s+([^,]+),\s*(\d+)/i,
        /from\s+([^0-9]+?)(?:\s*,\s*(\d+))?/i
      ];
      
      for (const regex of senderRegexes) {
        const match = message.match(regex);
        if (match) {
          sender = match[1].trim();
          if (match[2]) {
            phoneNumber = match[2];
          }
          break;
        }
      }
      
      const feeRegex = /fee:\s*(\d+(?:\.\d+)?)/i;
      const feeMatch = message.match(feeRegex);
      if (feeMatch) {
        const feeAmount = parseFloat(feeMatch[1]);
        fee = feeAmount > 0 ? feeAmount : undefined;
      }
    }
    
    // Parse send messages
    else if (lowerMessage.includes('you have sent') || lowerMessage.includes('sent ugx')) {
      type = 'send';
      
      const amountRegexes = [
        /(?:you have )?sent\s+ugx\s*([0-9,.]+)/i,
        /sent ugx\s*([0-9,.]+)/i
      ];
      
      for (const regex of amountRegexes) {
        const match = message.match(regex);
        if (match) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      const phoneRegex = /to\s+(\d+)/i;
      const phoneMatch = message.match(phoneRegex);
      if (phoneMatch) {
        phoneNumber = phoneMatch[1];
      }
      
      const feeRegex = /fee:\s*ugx\s*([0-9,.]+)/i;
      const feeMatch = message.match(feeRegex);
      if (feeMatch) {
        fee = parseFloat(feeMatch[1].replace(/,/g, ''));
      }
    }
    
    // Return null if we couldn't extract amount (but allow 0 for some special cases)
    if (amount === 0 && !lowerMessage.includes('received: ugx 0')) {
      console.log("Could not extract amount from MTN message:", message.substring(0, 100));
      return null;
    }
    
    return {
      id,
      type,
      amount,
      currency: 'UGX',
      sender,
      recipient,
      fee,
      tax,
      balance,
      reference,
      phoneNumber,
      timestamp
    };
  }
  
  /**
   * Check if message is from MTN Mobile Money
   */
  private isMTNMessage(message: string): boolean {
    const mtnIndicators = [
      'y\'ello',
      'mtn mobile money',
      'dial *165*3#',
      'momo app',
      'do not share your mobile money pin',
      'thank you for using mtn mobile money',
      'fee:ugx',
      'transaction id:',
      'mobile money balance is now'
    ];
    
    const lowerMessage = message.toLowerCase();
    return mtnIndicators.some(indicator => lowerMessage.includes(indicator)) ||
           (lowerMessage.includes('you have') && lowerMessage.includes('ugx')) ||
           (lowerMessage.includes('ugx') && (lowerMessage.includes('id:') || lowerMessage.includes('transaction id:')));
  }
}

export default new MTNParser();
