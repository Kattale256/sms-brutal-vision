
import { Transaction } from '../services/SmsReader';

export const isValidTransactionDate = (transaction: Transaction): boolean => {
  if (!transaction.timestamp) return false;
  
  const date = new Date(transaction.timestamp);
  
  // Check if it's a valid date and not January 1, 1970 (epoch) which indicates missing date
  return !isNaN(date.getTime()) && date.getTime() > 0;
};

export const separateTransactionsByDate = (transactions: Transaction[]) => {
  const datedTransactions: Transaction[] = [];
  const undatedTransactions: Transaction[] = [];
  
  transactions.forEach(transaction => {
    if (isValidTransactionDate(transaction)) {
      datedTransactions.push(transaction);
    } else {
      undatedTransactions.push(transaction);
    }
  });
  
  return { datedTransactions, undatedTransactions };
};
