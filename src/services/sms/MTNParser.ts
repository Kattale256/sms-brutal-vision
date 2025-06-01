
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
    
    // Extract balance (common to all MTN messages)
    const balanceRegex = /(?:new balance|balance is now):\s*ugx\s*([0-9,.]+)/i;
    const balanceMatch = message.match(balanceRegex);
    if (balanceMatch) {
      balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }
    
    // Extract transaction ID (common to all MTN messages)
    const idRegex = /(?:id|transaction id):\s*(\d+)/i;
    const idMatch = message.match(idRegex);
    if (idMatch) {
      reference = idMatch[1];
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
    if (lowerMessage.includes('you have withdrawn')) {
      type = 'withdrawal';
      
      const amountRegex = /you have withdrawn\s+ugx\s*([0-9,.]+)/i;
      const amountMatch = message.match(amountRegex);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
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
    else if (lowerMessage.includes('you have deposited')) {
      type = 'deposit';
      
      const amountRegex = /you have deposited\s+ugx\s*([0-9,.]+)/i;
      const amountMatch = message.match(amountRegex);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }
      
      const senderRegex = /from\s+([^0-9]+?)(?:\s+on|\s+\d)/i;
      const senderMatch = message.match(senderRegex);
      if (senderMatch) {
        sender = senderMatch[1].trim();
      }
    }
    
    // Parse payment messages
    else if (lowerMessage.includes('you have paid')) {
      type = 'payment';
      
      const amountRegex = /you have paid\s+ugx\s*([0-9,.]+)/i;
      const amountMatch = message.match(amountRegex);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
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
      
      const taxRegex = /tax:\s*ugx\s*([0-9,.]+)/i;
      const taxMatch = message.match(taxRegex);
      if (taxMatch) {
        tax = parseFloat(taxMatch[1].replace(/,/g, ''));
      }
    }
    
    // Parse receive messages
    else if (lowerMessage.includes('you have received')) {
      type = 'receive';
      
      const amountRegex = /you have received\s+ugx\s*([0-9,.]+)/i;
      const amountMatch = message.match(amountRegex);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }
      
      const senderRegex = /from\s+([^,]+),\s*(\d+)/i;
      const senderMatch = message.match(senderRegex);
      if (senderMatch) {
        sender = senderMatch[1].trim();
        phoneNumber = senderMatch[2];
      }
      
      const feeRegex = /fee:\s*(\d+(?:\.\d+)?)/i;
      const feeMatch = message.match(feeRegex);
      if (feeMatch) {
        const feeAmount = parseFloat(feeMatch[1]);
        fee = feeAmount > 0 ? feeAmount : undefined;
      }
    }
    
    // Parse send messages
    else if (lowerMessage.includes('you have sent')) {
      type = 'send';
      
      const amountRegex = /you have sent\s+ugx\s*([0-9,.]+)/i;
      const amountMatch = message.match(amountRegex);
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
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
      
      const taxRegex = /tax:\s*ugx\s*([0-9,.]+)/i;
      const taxMatch = message.match(taxRegex);
      if (taxMatch) {
        tax = parseFloat(taxMatch[1].replace(/,/g, ''));
      }
    }
    
    // Return null if we couldn't extract amount
    if (amount === 0) {
      console.log("Could not extract amount from MTN message:", message);
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
      'thank you for using mtn mobile money'
    ];
    
    const lowerMessage = message.toLowerCase();
    return mtnIndicators.some(indicator => lowerMessage.includes(indicator)) ||
           (lowerMessage.includes('you have') && lowerMessage.includes('ugx'));
  }
}

export default new MTNParser();
