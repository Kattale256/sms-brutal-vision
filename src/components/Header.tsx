
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import SmsReader from '../services/SmsReader';

const Header: React.FC<{
  onSmsImport?: (messages: any[]) => void;
}> = ({ onSmsImport }) => {
  const { toast } = useToast();
  const smsReader = SmsReader.getInstance();

  const handleSmsImport = async () => {
    if (smsReader.isNativePlatform()) {
      // If on mobile, request permission and read SMS
      const hasPermission = await smsReader.requestSmsPermission();
      
      if (hasPermission) {
        toast({
          title: "Reading SMS messages",
          description: "Please wait while we process your messages...",
        });
        
        const messages = await smsReader.readSms();
        
        if (messages.length > 0) {
          toast({
            title: "Success!",
            description: `${messages.length} messages imported.`,
          });
          
          if (onSmsImport) {
            onSmsImport(messages);
          }
        } else {
          toast({
            title: "No messages found",
            description: "We couldn't find any SMS messages to import. A custom native plugin is required for this feature.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Permission denied",
          description: "We need permission to access your SMS messages.",
          variant: "destructive",
        });
      }
    } else {
      // If on web, show file upload dialog
      toast({
        title: "Web version",
        description: "To use this feature on web, please export your SMS as a file and upload it.",
      });
      
      // Here we would implement file upload functionality
      // For now, we'll just show a message
    }
  };

  return (
    <header className="border-b-4 border-neo-black mb-6 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">
            SMS ANALYZER
          </h1>
          <p className="text-neo-gray font-medium mt-1">Extract insights from your messages</p>
        </div>
        <div>
          <button 
            className="neo-button bg-neo-yellow"
            onClick={handleSmsImport}
          >
            {smsReader.isNativePlatform() ? 'READ SMS' : 'IMPORT SMS'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
