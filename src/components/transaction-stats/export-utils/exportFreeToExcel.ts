
import * as XLSX from 'xlsx';
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalIncome,
  getFrequentContacts,
  getFeesByDate,
  getTotalTaxes
} from '../../../utils/transactionAnalyzer';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { toast } from 'sonner';

export const exportFreeToExcel = (transactions: Transaction[], quarterInfo?: QuarterInfo | null) => {
  // Get main currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  const totalIncome = getTotalIncome(transactions);
  const frequentContacts = getFrequentContacts(transactions);
  const feesByDate = getFeesByDate(transactions);
  
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = Object.entries(totalsByType).map(([type, amount]) => ({
    Type: typeLabels[type as keyof typeof typeLabels],
    Amount: `${amount.toFixed(2)} ${mainCurrency}`
  }));
  const summaryWS = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWS, "Transaction Summary");
  
  // Overview sheet
  const overviewData = [
    { Metric: 'Money In', Value: `${totalIncome.toFixed(2)} ${mainCurrency}` },
    { Metric: 'Money Out', Value: `${(totalsByType.send + totalsByType.payment + totalsByType.withdrawal).toFixed(2)} ${mainCurrency}` },
    { Metric: 'Fees Paid', Value: `${totalFees.toFixed(2)} ${mainCurrency}` },
    { Metric: 'Taxes', Value: `${totalTaxes.toFixed(2)} ${mainCurrency}` }
  ];
  const overviewWS = XLSX.utils.json_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewWS, "Financial Overview");
  
  // Fees sheet
  const feesData = Object.entries(feesByDate).map(([date, fee]) => ({
    Date: new Date(date).toLocaleDateString(),
    Fees: `${fee.toFixed(2)} ${mainCurrency}`
  }));
  const feesWS = XLSX.utils.json_to_sheet(feesData);
  XLSX.utils.book_append_sheet(workbook, feesWS, "Fees Over Time");
  
  // Recipients sheet
  const recipientsExcelData = Object.entries(frequentContacts).map(([name, count]) => ({
    Recipient: name || 'Unknown',
    Frequency: count
  }));
  const recipientsWS = XLSX.utils.json_to_sheet(recipientsExcelData);
  XLSX.utils.book_append_sheet(workbook, recipientsWS, "Recipients");
  
  // Transaction list
  const transactionData = transactions.map(t => ({
    Date: new Date(t.timestamp).toLocaleDateString(),
    Time: new Date(t.timestamp).toLocaleTimeString(),
    Type: typeLabels[t.type as keyof typeof typeLabels] || t.type,
    Amount: `${t.amount.toFixed(2)} ${t.currency}`,
    Fee: t.fee ? `${t.fee.toFixed(2)} ${t.currency}` : '-',
    Tax: t.tax ? `${t.tax.toFixed(2)} ${t.currency}` : '-',
    Reference: t.reference || '-',
    Details: t.type === 'receive' ? `From: ${t.sender || 'Unknown'}` :
             t.type === 'send' ? `To: ${t.recipient || 'Unknown'}` : 
             t.type === 'payment' ? `To: ${t.recipient || 'Unknown'}` : '-'
  }));
  const transactionWS = XLSX.utils.json_to_sheet(transactionData);
  XLSX.utils.book_append_sheet(workbook, transactionWS, "Transaction List");
  
  // Copyright and Disclosure sheet
  const currentYear = new Date().getFullYear();
  const quarterText = quarterInfo ? quarterInfo.label : "Full Financial Year";
  const copyrightData = [
    { Notice: 'FREE BASIC VERSION' },
    { Notice: 'This is a basic free version without security features.' },
    { Notice: '' },
    { Notice: `Extracted By Firm D1 Research Project on E-Payment Message Notification Analysis.` },
    { Notice: `(c) ${currentYear} FIRM D1, LDC KAMPALA` },
    { Notice: '' },
    { Notice: 'DISCLOSURE' },
    { Notice: 'This free version is provided courtesy of UATEA-Uganda.' },
    { Notice: `Report Period: ${quarterText}` },
    { Notice: '' },
    { Notice: 'For premium secured version with verification features, please purchase the premium version.' }
  ];
  const copyrightWS = XLSX.utils.json_to_sheet(copyrightData);
  XLSX.utils.book_append_sheet(workbook, copyrightWS, "Disclosure");
  
  // Generate filename based on quarter info
  const periodText = quarterInfo ? 
    `_${quarterInfo.label.replace(/\//g, '_')}` : 
    '_All_Time';
  
  // Write file
  XLSX.writeFile(workbook, `transaction-stats${periodText}_FREE.xlsx`);
  
  toast.success(`Free report exported successfully!`);
};
