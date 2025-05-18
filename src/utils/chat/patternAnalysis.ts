
import { Transaction } from '../../services/sms/types';

// Helper to get spending patterns by day of week
export const getSpendingPatternsByDay = (transactions: Transaction[]): Record<string, number> => {
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
export const compareMonthToMonth = (transactions: Transaction[]): string => {
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

// Calculate fees as percentage of total transaction amounts
export const getFeesPercentage = (transactions: Transaction[], totalFees: number): string => {
  const totalTransactionAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (totalTransactionAmount === 0) {
    return "0%";
  }
  
  const percentage = (totalFees / totalTransactionAmount) * 100;
  return `${percentage.toFixed(2)}%`;
};
