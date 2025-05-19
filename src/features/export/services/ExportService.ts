
import { Transaction } from '../../../services/sms/types';
import { QuarterInfo } from '../../../utils/quarterUtils';
import { exportToExcel } from '../../../components/transaction-stats/export-utils/exportToExcel';
import { exportToPDF } from '../../../components/transaction-stats/export-utils/exportToPDF';
import { exportCashFlow } from '../../../components/transaction-stats/export-utils/exportCashFlow';
import { exportFreeToExcel } from '../../../components/transaction-stats/export-utils/exportFreeToExcel';
import { exportFreeToPDF } from '../../../components/transaction-stats/export-utils/exportFreeToPDF';
import { exportFreeCashFlowToPDF } from '../../../components/transaction-stats/export-utils/exportFreeCashFlowToPDF';

/**
 * A service for handling all export operations in a consistent way
 */
class ExportService {
  /**
   * Export transactions to Excel
   */
  public exportToExcel(
    transactions: Transaction[], 
    quarterInfo?: QuarterInfo | null, 
    isPremium: boolean = false
  ): void {
    if (isPremium) {
      exportToExcel(transactions, quarterInfo);
    } else {
      exportFreeToExcel(transactions, quarterInfo);
    }
  }
  
  /**
   * Export transactions to PDF
   */
  public exportToPDF(
    transactions: Transaction[], 
    quarterInfo?: QuarterInfo | null,
    isPremium: boolean = false
  ): void {
    if (isPremium) {
      exportToPDF(transactions, quarterInfo);
    } else {
      exportFreeToPDF(transactions, quarterInfo);
    }
  }
  
  /**
   * Export cash flow statement
   */
  public exportCashFlow(
    transactions: Transaction[], 
    quarterInfo?: QuarterInfo | null,
    isPremium: boolean = false
  ): void {
    if (isPremium) {
      exportCashFlow(transactions, quarterInfo);
    } else {
      exportFreeCashFlowToPDF(transactions, quarterInfo);
    }
  }
}

export default new ExportService();
