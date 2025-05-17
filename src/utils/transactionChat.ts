
import { Transaction } from '../services/sms/types';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalTaxes, 
  getTotalIncome,
  getFrequentContacts,
  getAverageTransactionAmount
} from './transactionAnalyzer';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const analyzeTransactionQuery = (
  query: string, 
  transactions: Transaction[]
): string => {
  // Convert query to lowercase for easier pattern matching
  const lowerQuery = query.toLowerCase();
  
  // Handle empty transactions array
  if (!transactions || transactions.length === 0) {
    return "I don't see any transaction data to analyze. Please import some transactions first.";
  }
  
  // Total transaction amount
  if (lowerQuery.includes('total') && (lowerQuery.includes('amount') || lowerQuery.includes('sum'))) {
    const totals = getTotalsByType(transactions);
    const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
    const currency = transactions[0]?.currency || 'UGX';
    
    return `The total transaction amount across all categories is ${total.toLocaleString()} ${currency}.`;
  }
  
  // Transaction breakdown by type
  if ((lowerQuery.includes('breakdown') || lowerQuery.includes('summary')) && lowerQuery.includes('type')) {
    const totals = getTotalsByType(transactions);
    const currency = transactions[0]?.currency || 'UGX';
    
    return `Here's a breakdown of your transactions by type:
      - Sent: ${totals.send.toLocaleString()} ${currency}
      - Received: ${totals.receive.toLocaleString()} ${currency}
      - Payments: ${totals.payment.toLocaleString()} ${currency}
      - Withdrawals: ${totals.withdrawal.toLocaleString()} ${currency}
      - Deposits: ${totals.deposit.toLocaleString()} ${currency}`;
  }
  
  // Fees analysis
  if (lowerQuery.includes('fee') || lowerQuery.includes('charges')) {
    const totalFees = getTotalFees(transactions);
    const currency = transactions[0]?.currency || 'UGX';
    
    return `You've paid a total of ${totalFees.toLocaleString()} ${currency} in transaction fees.`;
  }
  
  // Tax analysis
  if (lowerQuery.includes('tax')) {
    const totalTaxes = getTotalTaxes(transactions);
    const currency = transactions[0]?.currency || 'UGX';
    
    return `You've paid a total of ${totalTaxes.toLocaleString()} ${currency} in taxes on your transactions.`;
  }
  
  // Income analysis
  if (lowerQuery.includes('income') || lowerQuery.includes('received') || lowerQuery.includes('earnings')) {
    const totalIncome = getTotalIncome(transactions);
    const currency = transactions[0]?.currency || 'UGX';
    
    return `Your total income (received transactions and deposits) is ${totalIncome.toLocaleString()} ${currency}.`;
  }
  
  // Frequent contacts
  if (lowerQuery.includes('contact') || lowerQuery.includes('recipient') || lowerQuery.includes('who')) {
    const contacts = getFrequentContacts(transactions);
    const sortedContacts = Object.entries(contacts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (sortedContacts.length === 0) {
      return "I couldn't identify any frequent contacts in your transaction data.";
    }
    
    let response = "Your most frequent transaction contacts are:\n";
    sortedContacts.forEach(([name, count], index) => {
      response += `${index + 1}. ${name} (${count} transactions)\n`;
    });
    
    return response;
  }
  
  // Average transaction
  if (lowerQuery.includes('average') || lowerQuery.includes('typical')) {
    const averages = getAverageTransactionAmount(transactions);
    const currency = transactions[0]?.currency || 'UGX';
    
    return `Here are your average transaction amounts:
      - Sent: ${averages.send.toLocaleString()} ${currency}
      - Received: ${averages.receive.toLocaleString()} ${currency}
      - Payments: ${averages.payment.toLocaleString()} ${currency}
      - Withdrawals: ${averages.withdrawal.toLocaleString()} ${currency}
      - Deposits: ${averages.deposit.toLocaleString()} ${currency}`;
  }
  
  // Count transactions
  if ((lowerQuery.includes('how many') || lowerQuery.includes('count')) && lowerQuery.includes('transaction')) {
    const totalCount = transactions.length;
    const typeCount = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return `You have ${totalCount} transactions in total:
      - Sent: ${typeCount.send || 0}
      - Received: ${typeCount.receive || 0}
      - Payments: ${typeCount.payment || 0}
      - Withdrawals: ${typeCount.withdrawal || 0}
      - Deposits: ${typeCount.deposit || 0}`;
  }
  
  // Handle unknown queries
  return "I'm not sure how to answer that question about your transactions. Try asking about total amounts, fees, transaction types, or frequent contacts.";
};

// Helper to generate a unique ID for chat messages
export const generateMessageId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
