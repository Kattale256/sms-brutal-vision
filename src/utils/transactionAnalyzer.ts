import { Transaction } from '../services/SmsReader';

export const getTotalsByType = (transactions: Transaction[]): Record<string, number> => {
  const totals: Record<string, number> = {
    send: 0,
    receive: 0,
    payment: 0,
    withdrawal: 0,
    deposit: 0
  };
  
  transactions.forEach(transaction => {
    totals[transaction.type] += transaction.amount;
  });
  
  return totals;
};

export const getBalanceHistory = (transactions: Transaction[]): Record<string, number> => {
  const history: Record<string, number> = {};
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Get the last known balance for each day
  sortedTransactions.forEach(transaction => {
    if (transaction.balance !== undefined) {
      const date = new Date(transaction.timestamp).toISOString().split('T')[0];
      history[date] = transaction.balance;
    }
  });
  
  return history;
};

export const getTotalFees = (transactions: Transaction[]): number => {
  return transactions
    .filter(transaction => transaction.fee !== undefined)
    .reduce((total, transaction) => total + (transaction.fee || 0), 0);
};

export const getTotalTaxes = (transactions: Transaction[]): number => {
  return transactions
    .filter(transaction => transaction.tax !== undefined)
    .reduce((total, transaction) => total + (transaction.tax || 0), 0);
};

export const getTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(transaction => transaction.type === 'receive' || transaction.type === 'deposit')
    .reduce((total, transaction) => total + transaction.amount, 0);
};

export const getFeesByDate = (transactions: Transaction[]): Record<string, number> => {
  const feesByDate: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (transaction.fee !== undefined && transaction.fee > 0) {
      const date = new Date(transaction.timestamp).toISOString().split('T')[0];
      feesByDate[date] = (feesByDate[date] || 0) + transaction.fee;
    }
  });
  
  // Sort by date
  return Object.fromEntries(
    Object.entries(feesByDate).sort(([a], [b]) => a.localeCompare(b))
  );
};

export const getTransactionsByDate = (transactions: Transaction[]): Record<string, number> => {
  const byDate: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.timestamp).toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });
  
  // Sort by date
  return Object.fromEntries(
    Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
  );
};

export const getFrequentContacts = (transactions: Transaction[]): Record<string, number> => {
  const contacts: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    const contact = transaction.type === 'send' ? transaction.recipient : transaction.sender;
    if (contact) {
      contacts[contact] = (contacts[contact] || 0) + 1;
    }
  });
  
  // Sort by frequency and take top 5
  return Object.fromEntries(
    Object.entries(contacts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  );
};

export const getAverageTransactionAmount = (transactions: Transaction[]): Record<string, number> => {
  const totals: Record<string, {sum: number, count: number}> = {
    send: {sum: 0, count: 0},
    receive: {sum: 0, count: 0},
    payment: {sum: 0, count: 0},
    withdrawal: {sum: 0, count: 0},
    deposit: {sum: 0, count: 0}
  };
  
  transactions.forEach(transaction => {
    totals[transaction.type].sum += transaction.amount;
    totals[transaction.type].count += 1;
  });
  
  const averages: Record<string, number> = {};
  Object.entries(totals).forEach(([type, {sum, count}]) => {
    averages[type] = count > 0 ? sum / count : 0;
  });
  
  return averages;
};
