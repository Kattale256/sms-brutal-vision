
import { Transaction } from '../../../services/sms/types';

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
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      break;
      
    case 'yesterday':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      endDate = today;
      break;
      
    case 'this_week':
      startDate = new Date(today);
      // Set to the first day of the week (Sunday)
      startDate.setDate(today.getDate() - today.getDay());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
      
    case 'last_week':
      startDate = new Date(today);
      // Set to the first day of last week
      startDate.setDate(today.getDate() - today.getDay() - 7);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
      
    case 'this_month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
      
    case 'last_month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
      
    default:
      startDate = new Date(0); // Jan 1, 1970
      endDate = now;
  }
  
  return transactions.filter(transaction => {
    const txDate = new Date(transaction.timestamp);
    return txDate >= startDate && txDate < endDate;
  });
};
