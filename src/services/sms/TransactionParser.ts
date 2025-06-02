
import { Transaction } from './types';
import mtnParser from './MTNParser';

export class TransactionParser {
  /**
   * Parses raw SMS text into transaction objects
   */
  public parseTransactionsFromText(text: string): Transaction[] {
    // Improved message splitting for MTN messages
    const messages = text.split(/(?=(?:SENT|RECEIVED|PAID|WITHDRAWN|DEPOSITED|You have (?:sent|received|paid|withdrawn|deposited)|Y'ello[^\n]*You have))/i)
      .filter(msg => msg.trim().length > 10); // Filter out very short fragments
    
    console.log(`Parsing ${messages.length} messages`);
    
    const transactions: Transaction[] = [];
    
    messages.forEach((message, index) => {
      const messageId = `msg_${index}_${Date.now()}`;
      
      // Clean up the message
      const cleanMessage = message.trim();
      
      // Skip if message is too short or just fragments
      if (cleanMessage.length < 20) {
        console.log(`Skipping short message: "${cleanMessage}"`);
        return;
      }
      
      console.log(`Processing message ${index}: "${cleanMessage.substring(0, 100)}..."`);
      
      // Try MTN parser first
      const mtnTransaction = mtnParser.parseMTNTransaction(cleanMessage, messageId);
      if (mtnTransaction) {
        transactions.push(mtnTransaction);
        console.log(`MTN transaction parsed: ${mtnTransaction.type} - ${mtnTransaction.amount} ${mtnTransaction.currency}`);
        return;
      }
      
      // Fall back to original parser for other formats
      const transaction = this.parseTransactionMessage(cleanMessage, messageId);
      if (transaction) {
        transactions.push(transaction);
        console.log(`Generic transaction parsed: ${transaction.type} - ${transaction.amount} ${transaction.currency}`);
      } else {
        console.log(`Could not parse message: "${cleanMessage.substring(0, 100)}..."`);
      }
    });
    
    console.log(`Extracted ${transactions.length} transactions`);
    return transactions;
  }

  /**
   * Parse a single transaction message (original parser for non-MTN messages)
   */
  private parseTransactionMessage(message: string, id: string): Transaction | null {
    const lowerMessage = message.toLowerCase();
    
    let type: Transaction['type'] = 'send';
    
    // Determine transaction type with expanded patterns
    if (lowerMessage.includes('received') || lowerMessage.includes('you have received')) {
      type = 'receive';
    } else if (lowerMessage.includes('sent') || lowerMessage.includes('you have sent')) {
      type = 'send';
    } else if (lowerMessage.includes('paid') || lowerMessage.includes('you have paid')) {
      type = 'payment';
    } else if (lowerMessage.includes('withdrawn') || lowerMessage.includes('you have withdrawn')) {
      type = 'withdrawal';
    } else if (lowerMessage.includes('deposited') || lowerMessage.includes('deposit') || lowerMessage.includes('you have deposited') || lowerMessage.includes('cash deposit')) {
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
    
    // Extract amount with expanded currency support
    const amountRegex = /(?:UGX|Shs|KES|TZS)\s*([0-9,.]+)/i;
    const amountMatch = message.match(amountRegex);
    
    if (!amountMatch) {
      console.log("Could not extract amount from message:", message);
      return null;
    }
    
    const amountStr = amountMatch[1].replace(/,/g, '');
    const amount = parseFloat(amountStr);
    
    // Determine currency
    let currency = 'UGX';
    if (message.includes('KES')) {
      currency = 'KES';
    } else if (message.includes('TZS')) {
      currency = 'TZS';
    }
    
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
      
      const feeRegex = /Fee\s+(?:UGX|Shs)\s*([0-9,]+(?:\.[0-9]+)?)/i;
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
      
      const feeRegex = /Fee\s+(?:UGX|Shs)\s*([0-9,]+(?:\.[0-9]+)?)/i;
      const feeMatch = message.match(feeRegex);
      fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, '')) : undefined;
      
      const taxRegex = /Tax\s+(?:UGX|Shs)\s*([0-9,]+(?:\.[0-9]+)?)/i;
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
      
      const chargeRegex = /Charge\s+(?:UGX|Shs)\s*([0-9,]+(?:\.[0-9]+)?)/i;
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
