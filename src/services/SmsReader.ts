
import { Capacitor } from "@capacitor/core";

export interface SmsMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  category?: string;
}

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
      // Use Capacitor's Plugins object to access Permissions plugin
      const { Permissions } = Capacitor.Plugins;
      
      const permissionStatus = await Permissions.query({ name: 'sms' });
      
      if (permissionStatus.state === 'granted') {
        this.hasPermission = true;
        return true;
      }
      
      if (permissionStatus.state === 'prompt') {
        const requestResult = await Permissions.request({ name: 'sms' });
        this.hasPermission = requestResult.state === 'granted';
        return this.hasPermission;
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
      return [];
    }

    try {
      console.log("Reading SMS using ContentProvider");
      
      // Access the registered plugin to read SMS
      // This would normally be implemented as a custom native plugin
      if (Capacitor.isPluginAvailable('SmsReader')) {
        console.log("SmsReader plugin is available");
        
        try {
          // Attempt to call the plugin
          const result = await Capacitor.Plugins.SmsReader.getSmsMessages({
            maxCount: 100,  // Limit to last 100 messages
            contentUri: "content://sms/inbox" // Android ContentProvider URI for SMS inbox
          });
          
          if (result && result.messages) {
            console.log(`Successfully read ${result.messages.length} SMS messages`);
            return this.formatSmsMessages(result.messages);
          }
        } catch (pluginError) {
          console.error("Error calling SmsReader plugin:", pluginError);
        }
      } else {
        console.log("SmsReader plugin is not available, native implementation required");
        console.log("For a complete implementation, create a custom Capacitor plugin using Android's ContentResolver");
      }
      
      // Return sample data if plugin is unavailable or fails
      console.log("Returning sample data instead");
      return this.getSampleData();
    } catch (error) {
      console.error("Error reading SMS:", error);
      return this.getSampleData();
    }
  }

  private formatSmsMessages(nativeMessages: any[]): SmsMessage[] {
    // Convert the native plugin's message format to our app format
    return nativeMessages.map((msg, index) => ({
      id: msg.id || String(index),
      sender: msg.address || msg.sender || 'Unknown',
      content: msg.body || msg.content || '',
      timestamp: msg.date ? new Date(msg.date).toISOString() : new Date().toISOString(),
      category: undefined // To be categorized later
    }));
  }

  private getSampleData(): SmsMessage[] {
    // This is just temporary until we have actual SMS access
    // In a real implementation, this would be replaced with actual SMS data
    return [
      // ... Sample data from sampleData.ts (will be replaced with real data)
      {
        id: '1',
        sender: '+1234567890',
        content: 'Your Amazon order #A123456 has shipped and will be delivered today.',
        timestamp: new Date().toISOString(),
        category: 'shopping'
      },
      {
        id: '2',
        sender: '+1987654321',
        content: 'Your account balance is $1,240.56. Visit chase.com for details.',
        timestamp: new Date().toISOString(),
        category: 'finance'
      },
      // ... More sample data would go here
    ];
  }
}

export default SmsReader;
