
import { Transaction } from '../../../services/sms/types';
import { getFrequentContacts } from '../../../utils/transactionAnalyzer';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF5722', '#795548', '#607D8B'];

interface BubbleData {
  name: string;
  value: number;
  size: number;
  radius: number;
  color: string;
  x: number;
  y: number;
}

export class BubbleDataProcessor {
  public static processBubbleData(transactions: Transaction[], isMobile: boolean): BubbleData[] {
    const frequentContacts = getFrequentContacts(transactions);
    const contactEntries = Object.entries(frequentContacts).slice(0, 9);
    
    if (contactEntries.length === 0) {
      return [];
    }
    
    const transactionCounts = contactEntries.map(([, count]) => count);
    const maxTransactions = Math.max(...transactionCounts);
    const minTransactions = Math.min(...transactionCounts);
    
    return contactEntries.map(([name, count], index) => {
      const bubbleSize = this.calculateBubbleSize(count, minTransactions, maxTransactions, isMobile);
      
      return {
        name: name || 'Unknown',
        value: count,
        size: bubbleSize,
        radius: bubbleSize / 2,
        color: COLORS[index % COLORS.length],
        x: 0, // Will be set by positioning algorithm
        y: 0  // Will be set by positioning algorithm
      };
    });
  }

  private static calculateBubbleSize(
    count: number, 
    minTransactions: number, 
    maxTransactions: number, 
    isMobile: boolean
  ): number {
    const baseSize = isMobile ? 6 : 8;
    const maxSize = isMobile ? 25 : 35;
    
    if (maxTransactions === minTransactions) {
      return (baseSize + maxSize) / 2;
    }
    
    // Use exponential scaling for more dramatic differences
    const ratio = (count - minTransactions) / (maxTransactions - minTransactions);
    const scaledRatio = Math.pow(ratio, 0.7); // Soften the curve
    return baseSize + (scaledRatio * (maxSize - baseSize));
  }
}
