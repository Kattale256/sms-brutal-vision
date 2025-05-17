
import jsPDF from 'jspdf';
import { Transaction } from '../../../services/SmsReader';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalTaxes,
  getTotalIncome,
  getTransactionsByDate
} from '../../../utils/transactionAnalyzer';
import { format } from 'date-fns';
import { generateDocumentMetadata, generateQRCodeData } from '../../../utils/securityUtils';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { toast } from 'sonner';

export const exportCashFlowToPDF = (transactions: Transaction[], quarterInfo?: QuarterInfo | null) => {
  // Get main currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  // Get document security metadata
  const metadata = generateDocumentMetadata(transactions, quarterInfo, 'cashflow');
  const qrCodeData = generateQRCodeData(metadata);
  
  const totalsByType = getTotalsByType(transactions);
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = totalsByType.send + totalsByType.payment + totalsByType.withdrawal;
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  const netCashFlow = totalIncome - totalExpenses - totalFees - totalTaxes;
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Get date range
  const startDate = sortedTransactions.length > 0 
    ? new Date(sortedTransactions[0].timestamp)
    : new Date();
  const endDate = sortedTransactions.length > 0
    ? new Date(sortedTransactions[sortedTransactions.length - 1].timestamp)
    : new Date();
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  const title = quarterInfo ? 
    `Cash Flow Statement - ${quarterInfo.label}` :
    'Cash Flow Statement';
  doc.text(title, 20, 20);
  
  // Date Range and Quarter info
  doc.setFontSize(12);
  if (quarterInfo) {
    doc.text(`Uganda Financial Year: ${quarterInfo.financialYear}`, 20, 30);
    doc.text(
      `Period: ${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`, 
      20, 35
    );
  } else {
    doc.text(
      `Period: ${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`, 
      20, 30
    );
  }
  
  let yPosition = 45;
  
  // Cash Flow Summary
  doc.setFontSize(16);
  doc.text("Cash Flow Summary", 20, yPosition);
  yPosition += 10;
  
  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(0, 0, 0);
  doc.rect(20, yPosition, 170, 10, 'FD');
  doc.setFontSize(12);
  doc.text("Category", 25, yPosition + 7);
  doc.text("Amount", 120, yPosition + 7);
  yPosition += 10;
  
  const addRow = (label: string, value: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, 190, yPosition);
    doc.text(label, 25, yPosition + 7);
    doc.text(`${value >= 0 ? '+' : ''}${value.toFixed(2)} ${mainCurrency}`, 120, yPosition + 7);
    yPosition += 10;
  };
  
  // Income
  addRow("INCOME", totalIncome);
  addRow("    Received Transfers", totalsByType.receive);
  addRow("    Deposits", totalsByType.deposit);
  addRow("    Other Income", totalsByType.other || 0);
  yPosition += 5;
  
  // Expenses
  addRow("EXPENSES", -totalExpenses);
  addRow("    Sent Transfers", -totalsByType.send);
  addRow("    Payments", -totalsByType.payment);
  addRow("    Withdrawals", -totalsByType.withdrawal);
  yPosition += 5;
  
  // Fees and Taxes
  addRow("FEES & TAXES", -(totalFees + totalTaxes));
  addRow("    Transaction Fees", -totalFees);
  addRow("    Taxes Paid", -totalTaxes);
  yPosition += 5;
  
  // Net Cash Flow
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition, 170, 10, 'FD');
  doc.setFont("helvetica", "bold");
  doc.text("NET CASH FLOW", 25, yPosition + 7);
  doc.text(
    `${netCashFlow >= 0 ? '+' : ''}${netCashFlow.toFixed(2)} ${mainCurrency}`,
    120, yPosition + 7
  );
  yPosition += 20;
  doc.setFont("helvetica", "normal");
  
  // Transactions by Category
  const categorizedTransactions: Record<string, number> = {};
  transactions.forEach(t => {
    // Use type as category if no specific category is available
    const category = t.type;
    if (category) {
      categorizedTransactions[category] = 
        (categorizedTransactions[category] || 0) + t.amount * (t.type === 'receive' || t.type === 'deposit' ? 1 : -1);
    }
  });
  
  if (Object.keys(categorizedTransactions).length > 0) {
    doc.setFontSize(16);
    doc.text("Business Categories", 20, yPosition);
    yPosition += 10;
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition, 170, 10, 'FD');
    doc.setFontSize(12);
    doc.text("Category", 25, yPosition + 7);
    doc.text("Amount", 120, yPosition + 7);
    yPosition += 10;
    
    // Sort categories by amount
    const sortedCategories = Object.entries(categorizedTransactions)
      .sort(([, a], [, b]) => b - a);
    
    sortedCategories.forEach(([category, amount]) => {
      addRow(category, amount);
    });
  }
  
  // Add security information
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  } else {
    yPosition += 20;
  }
  
  // Security section
  doc.setFontSize(14);
  doc.text("Document Authentication", 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.text(`Document ID: ${metadata.documentId}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Generated: ${new Date(metadata.timestamp).toLocaleString()}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Verification URL: ${window.location.origin}/verify?id=${metadata.documentId}`, 20, yPosition);
  yPosition += 20;
  
  // QR code would be added here in a real implementation
  doc.rect(20, yPosition, 50, 50);
  doc.text("QR Code for Verification", 25, yPosition + 25);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy h:mm a')} • Secured Document`, 20, 280);
  
  // Generate filename based on quarter info
  const periodText = quarterInfo ? 
    `_${quarterInfo.label.replace(/\//g, '_')}` : 
    '_All_Time';
    
  doc.save(`cash-flow-statement${periodText}.pdf`);
  
  toast.success(`Cash flow statement exported successfully!`);
};
