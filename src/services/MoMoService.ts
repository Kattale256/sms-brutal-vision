
import { toast } from "sonner";

export interface MoMoConfig {
  apiKey: string;
  userId: string;
  baseUrl: string;
}

export interface PaymentProduct {
  id: string;
  name: string;
  price: number;
  description: string;
}

// Product configuration for different export types and quarters
export const EXPORT_PRODUCTS: Record<string, PaymentProduct> = {
  'excel-current-quarter': {
    id: 'excel-current-quarter',
    name: 'Excel Report (Current Quarter)',
    price: 1500,
    description: 'Export transaction data to Excel for the current quarter'
  },
  'excel-full-year': {
    id: 'excel-full-year',
    name: 'Excel Report (Full Year)',
    price: 4500,
    description: 'Export transaction data to Excel for the full financial year'
  },
  'pdf-current-quarter': {
    id: 'pdf-current-quarter',
    name: 'PDF Report (Current Quarter)',
    price: 2000,
    description: 'Export transaction visualizations to PDF for the current quarter'
  },
  'pdf-full-year': {
    id: 'pdf-full-year',
    name: 'PDF Report (Full Year)',
    price: 6000,
    description: 'Export transaction visualizations to PDF for the full financial year'
  },
  'cashflow-current-quarter': {
    id: 'cashflow-current-quarter',
    name: 'Cash Flow Statement (Current Quarter)',
    price: 2500,
    description: 'Export cash flow statement to PDF for the current quarter'
  },
  'cashflow-full-year': {
    id: 'cashflow-full-year',
    name: 'Cash Flow Statement (Full Year)',
    price: 7500,
    description: 'Export cash flow statement to PDF for the full financial year'
  }
};

// Mock MoMo API for demo purposes
// In a real app, this would connect to the actual MTN MoMo API
export class MoMoService {
  private config: MoMoConfig;
  private authToken: string | null = null;
  
  constructor(config: MoMoConfig) {
    this.config = config;
  }
  
  async getAuthToken(): Promise<string> {
    try {
      // Mock authentication - in real app, this would call the MoMo API
      console.log('Getting auth token with API key:', this.config.apiKey);
      this.authToken = `mock-auth-token-${Date.now()}`;
      return this.authToken;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate with MoMo API');
    }
  }
  
  async requestPayment(
    phoneNumber: string, 
    product: PaymentProduct,
    referenceId: string
  ): Promise<{ referenceId: string }> {
    try {
      if (!this.authToken) {
        await this.getAuthToken();
      }
      
      // Mock API call to request payment
      console.log(`Requesting payment of ${product.price} UGX from ${phoneNumber} for ${product.name}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { referenceId };
    } catch (error) {
      console.error('Payment request error:', error);
      throw new Error('Failed to request payment');
    }
  }
  
  async checkPaymentStatus(referenceId: string): Promise<'PENDING' | 'SUCCESSFUL' | 'FAILED'> {
    try {
      if (!this.authToken) {
        await this.getAuthToken();
      }
      
      // Mock API call to check payment status
      console.log(`Checking payment status for reference: ${referenceId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, randomly simulate different payment outcomes
      // In production, this should actually check the MTN MoMo API
      const outcomes: Array<'PENDING' | 'SUCCESSFUL' | 'FAILED'> = ['SUCCESSFUL', 'SUCCESSFUL', 'SUCCESSFUL', 'PENDING', 'FAILED'];
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      return randomOutcome;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error('Failed to check payment status');
    }
  }
}

// Create a singleton instance with default config
export const momoService = new MoMoService({
  apiKey: 'demo-api-key',
  userId: 'demo-user-id',
  baseUrl: 'https://api.mtn.com/collection/v1'
});

// Helper to generate a unique reference ID
export const generateReferenceId = (): string => {
  return `TX-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};
