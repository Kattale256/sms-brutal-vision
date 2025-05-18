
import { Transaction } from '../services/sms/types';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalTaxes, 
  getTotalIncome,
  getFrequentContacts,
  getAverageTransactionAmount,
  getTransactionsByDate,
  getFeesByDate
} from './transactionAnalyzer';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Helper to get spending patterns by day of week
const getSpendingPatternsByDay = (transactions: Transaction[]): Record<string, number> => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const spendingByDay: Record<string, number> = {};
  
  dayNames.forEach(day => {
    spendingByDay[day] = 0;
  });
  
  transactions.forEach(transaction => {
    if (transaction.type === 'send' || transaction.type === 'payment') {
      const date = new Date(transaction.timestamp);
      const dayName = dayNames[date.getDay()];
      spendingByDay[dayName] = (spendingByDay[dayName] || 0) + transaction.amount;
    }
  });
  
  return spendingByDay;
};

// Helper to compare month to month spending
const compareMonthToMonth = (transactions: Transaction[]): string => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const currentYear = now.getFullYear();
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.timestamp);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.timestamp);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });
  
  const currentMonthSpending = currentMonthTransactions
    .filter(t => t.type === 'send' || t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const lastMonthSpending = lastMonthTransactions
    .filter(t => t.type === 'send' || t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const difference = currentMonthSpending - lastMonthSpending;
  const percentChange = lastMonthSpending === 0 ? 100 : (difference / lastMonthSpending) * 100;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (currentMonthTransactions.length === 0 && lastMonthTransactions.length === 0) {
    return "I don't have data for either this month or last month to make a comparison.";
  }
  
  const currency = transactions[0]?.currency || 'UGX';
  
  return `Comparing ${monthNames[currentMonth]} to ${monthNames[lastMonth]}:
  
  ${monthNames[currentMonth]} spending: ${currentMonthSpending.toLocaleString()} ${currency} (${currentMonthTransactions.length} transactions)
  ${monthNames[lastMonth]} spending: ${lastMonthSpending.toLocaleString()} ${currency} (${lastMonthTransactions.length} transactions)
  
  ${difference > 0 
    ? `You've spent ${Math.abs(difference).toLocaleString()} ${currency} more this month (${percentChange.toFixed(1)}% increase).` 
    : `You've spent ${Math.abs(difference).toLocaleString()} ${currency} less this month (${Math.abs(percentChange).toFixed(1)}% decrease).`}`;
};

// Helper to get transactions from a specific time period
const getTransactionsFromTimePeriod = (
  transactions: Transaction[],
  period: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month'
): Transaction[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate: Date;
  let endDate: Date;
  
  switch (period) {
    case 'today':
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'yesterday':
      startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      endDate = today;
      break;
    case 'this_week': 
      startDate = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      endDate = now;
      break;
    case 'last_week':
      startDate = new Date(today.getTime() - ((today.getDay() + 7) * 24 * 60 * 60 * 1000));
      endDate = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    default:
      startDate = new Date(0);
      endDate = now;
  }
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

// Calculate fees as percentage of total transaction amounts
const getFeesPercentage = (transactions: Transaction[]): string => {
  const totalTransactionAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = getTotalFees(transactions);
  
  if (totalTransactionAmount === 0) {
    return "0%";
  }
  
  const percentage = (totalFees / totalTransactionAmount) * 100;
  return `${percentage.toFixed(2)}%`;
};

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
    
    if (lowerQuery.includes('percentage') || lowerQuery.includes('percent')) {
      const percentage = getFeesPercentage(transactions);
      return `Fees make up ${percentage} of your total transaction amounts. You've paid a total of ${totalFees.toLocaleString()} ${currency} in transaction fees.`;
    } else if (lowerQuery.includes('over time') || lowerQuery.includes('by date')) {
      const feesByDate = getFeesByDate(transactions);
      const dates = Object.keys(feesByDate).slice(-5); // Get the last 5 dates
      
      let response = `Here are your fees over the last ${dates.length} dates with transactions:\n\n`;
      dates.forEach(date => {
        response += `- ${date}: ${feesByDate[date].toLocaleString()} ${currency}\n`;
      });
      
      return response;
    }
    
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
  
  // NEW ANALYSIS CAPABILITIES
  
  // Spending patterns by day of week
  if (lowerQuery.includes('pattern') || 
      (lowerQuery.includes('spend') && lowerQuery.includes('most')) ||
      (lowerQuery.includes('day') && lowerQuery.includes('week'))) {
    const spendingByDay = getSpendingPatternsByDay(transactions);
    const currency = transactions[0]?.currency || 'UGX';
    
    const sortedDays = Object.entries(spendingByDay)
      .sort((a, b) => b[1] - a[1]);
    
    let response = "Here's your spending pattern by day of week:\n\n";
    sortedDays.forEach(([day, amount]) => {
      response += `- ${day}: ${amount.toLocaleString()} ${currency}\n`;
    });
    
    const highestDay = sortedDays[0];
    response += `\nYou spend the most on ${highestDay[0]}, with ${highestDay[1].toLocaleString()} ${currency} in transactions.`;
    
    return response;
  }
  
  // Month to month comparison
  if (lowerQuery.includes('compare') && 
     (lowerQuery.includes('month') || lowerQuery.includes('monthly'))) {
    return compareMonthToMonth(transactions);
  }
  
  // Time-based filtering
  if ((lowerQuery.includes('show') || lowerQuery.includes('what')) && 
      (lowerQuery.includes('last week') || lowerQuery.includes('this week') ||
       lowerQuery.includes('last month') || lowerQuery.includes('this month') ||
       lowerQuery.includes('yesterday') || lowerQuery.includes('today'))) {
    
    let period: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' = 'this_week';
    
    if (lowerQuery.includes('today')) {
      period = 'today';
    } else if (lowerQuery.includes('yesterday')) {
      period = 'yesterday';
    } else if (lowerQuery.includes('last week')) {
      period = 'last_week';
    } else if (lowerQuery.includes('this week')) {
      period = 'this_week';
    } else if (lowerQuery.includes('last month')) {
      period = 'last_month';
    } else if (lowerQuery.includes('this month')) {
      period = 'this_month';
    }
    
    const filteredTransactions = getTransactionsFromTimePeriod(transactions, period);
    const currency = transactions[0]?.currency || 'UGX';
    
    if (filteredTransactions.length === 0) {
      return `No transactions found for ${period.replace('_', ' ')}.`;
    }
    
    const totals = filteredTransactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    let response = `Transactions for ${period.replace('_', ' ')}:\n\n`;
    response += `Total count: ${filteredTransactions.length} transactions\n\n`;
    
    Object.entries(totals).forEach(([type, amount]) => {
      response += `- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${amount.toLocaleString()} ${currency}\n`;
    });
    
    // Add largest transaction info
    const largest = filteredTransactions.reduce((max, t) => 
      t.amount > max.amount ? t : max, filteredTransactions[0]);
    
    response += `\nLargest transaction: ${largest.amount.toLocaleString()} ${currency} (${largest.type})`;
    if (largest.recipient) {
      response += ` to ${largest.recipient}`;
    }
    
    return response;
  }
  
  // Largest transaction for any time period
  if (lowerQuery.includes('largest') || 
     (lowerQuery.includes('biggest') && lowerQuery.includes('transaction'))) {
    
    // Try to detect time period
    let filteredTransactions = transactions;
    
    if (lowerQuery.includes('today')) {
      filteredTransactions = getTransactionsFromTimePeriod(transactions, 'today');
    } else if (lowerQuery.includes('yesterday')) {
      filteredTransactions = getTransactionsFromTimePeriod(transactions, 'yesterday');
    } else if (lowerQuery.includes('last week')) {
      filteredTransactions = getTransactionsFromTimePeriod(transactions, 'last_week');
    } else if (lowerQuery.includes('this week')) {
      filteredTransactions = getTransactionsFromTimePeriod(transactions, 'this_week');
    } else if (lowerQuery.includes('last month')) {
      filteredTransactions = getTransactionsFromTimePeriod(transactions, 'last_month');
    } else if (lowerQuery.includes('this month')) {
      filteredTransactions = getTransactionsFromTimePeriod(transactions, 'this_month');
    }
    
    if (filteredTransactions.length === 0) {
      return "No transactions found for the specified time period.";
    }
    
    const largest = filteredTransactions.reduce((max, t) => 
      t.amount > max.amount ? t : max, filteredTransactions[0]);
    
    const currency = transactions[0]?.currency || 'UGX';
    const date = new Date(largest.timestamp).toLocaleDateString();
    
    let response = `Your largest transaction was ${largest.amount.toLocaleString()} ${currency} on ${date}.\n`;
    response += `Type: ${largest.type}`;
    
    if (largest.recipient) {
      response += `\nRecipient: ${largest.recipient}`;
    }
    
    if (largest.sender) {
      response += `\nSender: ${largest.sender}`;
    }
    
    if (largest.reference) {
      response += `\nReference: ${largest.reference}`;
    }
    
    return response;
  }
  
  // Handle unknown queries
  return "I'm not sure how to answer that question about your transactions. Try asking about total amounts, fees, transaction types, spending patterns, or time-based analyses.";
};

// Helper to generate a unique ID for chat messages
export const generateMessageId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
