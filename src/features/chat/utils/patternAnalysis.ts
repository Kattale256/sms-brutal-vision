
import { Transaction } from '../../../services/sms/types';

export const getSpendingPatternsByDay = (transactions: Transaction[]): Record<string, number> => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const spendingByDay: Record<string, number> = {};
  
  // Initialize with zero for all days
  days.forEach(day => {
    spendingByDay[day] = 0;
  });
  
  // Filter transactions that are outgoing (send, payment, withdrawal)
  const outgoingTransactions = transactions.filter(t => 
    t.type === 'send' || t.type === 'payment' || t.type === 'withdrawal'
  );
  
  // Accumulate spending by day of week
  outgoingTransactions.forEach(transaction => {
    const date = new Date(transaction.timestamp);
    const day = days[date.getDay()];
    spendingByDay[day] += transaction.amount;
  });
  
  return spendingByDay;
};

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
  
  const currentMonthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });
  const lastMonthName = new Date(lastMonthYear, lastMonth, 1).toLocaleString('default', { month: 'long' });
  
  const currency = transactions[0]?.currency || 'UGX';
  
  // Calculate totals by type for both months
  const calculateTotalsByType = (txs: Transaction[]) => {
    return txs.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  };
  
  const currentMonthTotals = calculateTotalsByType(currentMonthTransactions);
  const lastMonthTotals = calculateTotalsByType(lastMonthTransactions);
  
  // Calculate total spending and income
  const calculateSpending = (totals: Record<string, number>) => {
    return (totals.send || 0) + (totals.payment || 0) + (totals.withdrawal || 0);
  };
  
  const calculateIncome = (totals: Record<string, number>) => {
    return (totals.receive || 0) + (totals.deposit || 0);
  };
  
  const currentMonthSpending = calculateSpending(currentMonthTotals);
  const lastMonthSpending = calculateSpending(lastMonthTotals);
  
  const currentMonthIncome = calculateIncome(currentMonthTotals);
  const lastMonthIncome = calculateIncome(lastMonthTotals);
  
  // Calculate percentages
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10; // Round to 1 decimal place
  };
  
  const spendingChange = getPercentageChange(currentMonthSpending, lastMonthSpending);
  const incomeChange = getPercentageChange(currentMonthIncome, lastMonthIncome);
  
  let response = `Here's a comparison between ${currentMonthName} and ${lastMonthName}:\n\n`;
  
  response += `Transactions: ${currentMonthTransactions.length} vs ${lastMonthTransactions.length} (${
    getPercentageChange(currentMonthTransactions.length, lastMonthTransactions.length) > 0 ? '+' : ''
  }${getPercentageChange(currentMonthTransactions.length, lastMonthTransactions.length)}%)\n\n`;
  
  response += `Spending: ${currentMonthSpending.toLocaleString()} ${currency} vs ${lastMonthSpending.toLocaleString()} ${currency} (${
    spendingChange > 0 ? '+' : ''
  }${spendingChange}%)\n\n`;
  
  response += `Income: ${currentMonthIncome.toLocaleString()} ${currency} vs ${lastMonthIncome.toLocaleString()} ${currency} (${
    incomeChange > 0 ? '+' : ''
  }${incomeChange}%)\n\n`;
  
  // Add insights
  if (spendingChange > 10) {
    response += `⚠️ Your spending has increased significantly compared to last month.\n`;
  } else if (spendingChange < -10) {
    response += `✅ You've reduced your spending compared to last month.\n`;
  }
  
  if (incomeChange > 10) {
    response += `💰 Your income has increased compared to last month.\n`;
  } else if (incomeChange < -10) {
    response += `📉 Your income has decreased compared to last month.\n`;
  }
  
  return response;
};

export const getFeesPercentage = (transactions: Transaction[], totalFees: number): string => {
  // Calculate total transaction volume
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate percentage
  const percentage = (totalFees / totalVolume) * 100;
  
  // Format to 2 decimal places
  return percentage.toFixed(2) + '%';
};
