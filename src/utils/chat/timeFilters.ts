
import { Transaction } from '../../services/sms/types';

// Helper to get transactions from a specific time period
export const getTransactionsFromTimePeriod = (
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
