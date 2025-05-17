
import { Transaction } from './types';

export class TransactionParser {
  /**
   * Parses raw SMS text into transaction objects
   */
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

  /**
   * Parse a single transaction message
   */
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
}

export default new TransactionParser();
