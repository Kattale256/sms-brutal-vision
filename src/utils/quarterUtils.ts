
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
  if (month >= 6 && month <= 8) {
    // July-September: Q1
    quarter = 1;
    financialYear = `${year}/${year + 1}`;
  } else if (month >= 9 && month <= 11) {
    // October-December: Q2
    quarter = 2;
    financialYear = `${year}/${year + 1}`;
  } else if (month >= 0 && month <= 2) {
    // January-March: Q3
    quarter = 3;
    financialYear = `${year - 1}/${year}`;
  } else {
    // April-June: Q4
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
    const quarterInfo = getTransactionQuarter(transaction);
    return quarterInfo.quarter === quarter && quarterInfo.financialYear === financialYear;
  });
};
