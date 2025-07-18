
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getFrequentContacts,
  getFeesByDate,
  getTotalTaxes
} from '../../../utils/transactionAnalyzer';

export interface ChartDataItem {
  name: string;
  amount: number;
}

export interface RecipientDataItem {
  name: string;
  value: number;
}

export interface FeeChartDataItem {
  date: string;
  fees: number;
}

export interface ChartData {
  chartData: ChartDataItem[];
  recipientsData: RecipientDataItem[];
  feesChartData: FeeChartDataItem[];
  totalsByType: Record<string, number>;
  totalTaxes: number;
  mainCurrency: string;
}

export const prepareChartData = (transactions: Transaction[]): ChartData => {
  console.log('Preparing chart data for', transactions.length, 'transactions');
  
  // Get most common currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UGX';
  
  const totalsByType = getTotalsByType(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  const frequentContacts = getFrequentContacts(transactions);
  const feesByDate = getFeesByDate(transactions);
  
  console.log('Analysis results:', {
    totalsByType,
    totalTaxes,
    frequentContactsCount: Object.keys(frequentContacts).length,
    feesByDateCount: Object.keys(feesByDate).length
  });
  
  const typeLabels = {
    send: 'Sent',
    receive: 'Received', 
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  const chartData = Object.entries(totalsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, amount]) => ({
      name: typeLabels[type as keyof typeof typeLabels] || type,
      amount: amount
    }));
    
  const recipientsData = Object.entries(frequentContacts)
    .map(([name, count]) => ({
      name: name || 'Unknown',
      value: count
    }))
    .sort((a, b) => b.value - a.value); // Sort by frequency
    
  const feesChartData = Object.entries(feesByDate).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fees: amount
  }));
  
  console.log('Prepared chart data:', {
    chartDataItems: chartData.length,
    recipientsDataItems: recipientsData.length,
    feesChartDataItems: feesChartData.length
  });
  
  return {
    chartData,
    recipientsData,
    feesChartData,
    totalsByType,
    totalTaxes,
    mainCurrency
  };
};
