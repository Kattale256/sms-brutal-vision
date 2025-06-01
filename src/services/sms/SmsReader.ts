
import { Capacitor } from "@capacitor/core";
import { SmsMessage, Transaction } from './types';
import transactionParser from './TransactionParser';
import sampleDataProvider from './SampleDataProvider';

class SmsReader {
  private static instance: SmsReader;
  private hasPermission: boolean = false;

  private constructor() {}

  public static getInstance(): SmsReader {
    if (!SmsReader.instance) {
      SmsReader.instance = new SmsReader();
    }
    return SmsReader.instance;
  }

  public isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  public async requestSmsPermission(): Promise<boolean> {
    if (!this.isNativePlatform()) {
      console.log("Not on a native platform");
      return false;
    }

    try {
      try {
        // @ts-ignore - Capacitor permissions API
        const permissionStatus = await Capacitor.Permissions?.query({ name: 'sms' });
        
        if (permissionStatus?.state === 'granted') {
          this.hasPermission = true;
          return true;
        }
        
        if (permissionStatus?.state === 'prompt') {
          // @ts-ignore - Capacitor permissions API
          const requestResult = await Capacitor.Permissions?.request({ name: 'sms' });
          this.hasPermission = requestResult?.state === 'granted';
          return this.hasPermission;
        }
      } catch (permissionError) {
        console.log("SMS permission system not available:", permissionError);
      }
      
      console.log("SMS permission denied");
      return false;
    } catch (error) {
      console.error("Error requesting SMS permission:", error);
      return false;
    }
  }

  public async readSms(): Promise<SmsMessage[]> {
    if (!this.isNativePlatform() || !this.hasPermission) {
      console.log("Cannot read SMS: not on native platform or no permission");
      return sampleDataProvider.getSampleData();
    }

    try {
      console.log("Reading SMS using ContentProvider");
      
      const isAvailable = Capacitor.isPluginAvailable('SmsReader');
      if (isAvailable) {
        console.log("SmsReader plugin is available");
        
        try {
          // @ts-ignore - Custom SMS reader plugin
          const smsReader = Capacitor.Plugins?.SmsReader;
          
          if (smsReader) {
            const result = await smsReader.getSmsMessages({
              maxCount: 100,
              contentUri: "content://sms/inbox"
            });
            
            if (result && result.messages) {
              console.log(`Successfully read ${result.messages.length} SMS messages`);
              return this.formatSmsMessages(result.messages);
            }
          }
        } catch (pluginError) {
          console.error("Error calling SmsReader plugin:", pluginError);
        }
      } else {
        console.log("SmsReader plugin is not available, native implementation required");
      }
      
      console.log("Returning sample data instead");
      return sampleDataProvider.getSampleData();
    } catch (error) {
      console.error("Error reading SMS:", error);
      return sampleDataProvider.getSampleData();
    }
  }

  public parseTransactionsFromText(text: string): Transaction[] {
    return transactionParser.parseTransactionsFromText(text);
  }

  private formatSmsMessages(nativeMessages: any[]): SmsMessage[] {
    // Format native SMS messages to our SmsMessage interface
    return nativeMessages.map((msg, index) => ({
      id: index.toString(),
      sender: msg.sender || 'Unknown',
      content: msg.content || '',
      timestamp: msg.timestamp || new Date().toISOString(),
      category: undefined
    }));
  }
}

export default SmsReader;
