
import { Transaction } from '../services/SmsReader';

// Uganda's financial year runs from July 1st to June 30th
// Q1: July-September, Q2: October-December, Q3: January-March, Q4: April-June

export interface QuarterInfo {
  quarter: number; // 1-4
  financialYear: string; // Format: "2024/2025"
  label: string; // Format: "Q1 2024/2025"
}

export const getQuarterInfo = (date: Date): QuarterInfo => {
  const month = date.getMonth(); // 0-11 (Jan-Dec)
  const year = date.getFullYear();
  
  let quarter: number;
  let financialYear: string;
  
  // Determine quarter in Uganda's financial year
  // Note: getMonth() returns 0=Jan, 1=Feb, ..., 6=Jul, 7=Aug, 8=Sep, 9=Oct, 10=Nov, 11=Dec
  if (month >= 6 && month <= 8) {
    // July(6)-September(8): Q1
    quarter = 1;
    financialYear = `${year}/${year + 1}`;
  } else if (month >= 9 && month <= 11) {
    // October(9)-December(11): Q2
    quarter = 2;
    financialYear = `${year}/${year + 1}`;
  } else if (month >= 0 && month <= 2) {
    // January(0)-March(2): Q3
    quarter = 3;
    financialYear = `${year - 1}/${year}`;
  } else {
    // April(3)-June(5): Q4
    quarter = 4;
    financialYear = `${year - 1}/${year}`;
  }
  
  return {
    quarter,
    financialYear,
    label: `Q${quarter} ${financialYear}`
  };
};

export const getTransactionQuarter = (transaction: Transaction): QuarterInfo => {
  const date = new Date(transaction.timestamp);
  return getQuarterInfo(date);
};

export const groupTransactionsByQuarter = (transactions: Transaction[]): Record<string, Transaction[]> => {
  const quarterMap: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const quarterInfo = getTransactionQuarter(transaction);
    const key = quarterInfo.label;
    
    if (!quarterMap[key]) {
      quarterMap[key] = [];
    }
    
    quarterMap[key].push(transaction);
  });
  
  return quarterMap;
};

export const getAllQuartersInData = (transactions: Transaction[]): QuarterInfo[] => {
  const quarterSet = new Set<string>();
  const quarterInfos: QuarterInfo[] = [];
  
  transactions.forEach(transaction => {
    const quarterInfo = getTransactionQuarter(transaction);
    const key = quarterInfo.label;
    
    if (!quarterSet.has(key)) {
      quarterSet.add(key);
      quarterInfos.push(quarterInfo);
    }
  });
  
  // Sort quarters chronologically - first by financial year, then by quarter
  return quarterInfos.sort((a, b) => {
    const yearA = parseInt(a.financialYear.split('/')[0]);
    const yearB = parseInt(b.financialYear.split('/')[0]);
    
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    
    return a.quarter - b.quarter;
  });
};

export const getCurrentQuarter = (): QuarterInfo => {
  return getQuarterInfo(new Date());
};

export const filterTransactionsByQuarter = (
  transactions: Transaction[], 
  quarter: number, 
  financialYear: string
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    
    // Handle invalid dates
    if (isNaN(transactionDate.getTime())) {
      console.warn('Invalid transaction date:', transaction.timestamp);
      return false;
    }
    
    const quarterInfo = getQuarterInfo(transactionDate);
    const matches = quarterInfo.quarter === quarter && quarterInfo.financialYear === financialYear;
    
    // Debug logging for quarter filtering
    if (process.env.NODE_ENV === 'development') {
      console.log(`Transaction ${transaction.timestamp}: Q${quarterInfo.quarter} ${quarterInfo.financialYear}, matches Q${quarter} ${financialYear}: ${matches}`);
    }
    
    return matches;
  });
};
