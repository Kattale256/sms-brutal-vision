import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import SmsReader from '../services/SmsReader';
import { Transaction } from '../services/SmsReader';
import { Clipboard, Smartphone } from 'lucide-react';
const Header: React.FC<{
  onSmsImport?: (messages: any[]) => void;
  onTransactionsImport?: (transactions: Transaction[]) => void;
}> = ({
  onSmsImport,
  onTransactionsImport
}) => {
  const {
    toast
  } = useToast();
  const smsReader = SmsReader.getInstance();
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const handleSmsImport = async () => {
    if (smsReader.isNativePlatform()) {
      const hasPermission = await smsReader.requestSmsPermission();
      if (hasPermission) {
        toast({
          title: "Reading SMS messages",
          description: "Please wait while we process your messages..."
        });
        const messages = await smsReader.readSms();
        if (messages.length > 0) {
          toast({
            title: "Success!",
            description: `${messages.length} messages imported.`
          });
          if (onSmsImport) {
            onSmsImport(messages);
          }
        } else {
          toast({
            title: "No messages found",
            description: "We couldn't find any SMS messages to import. A custom native plugin is required for this feature.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Permission denied",
          description: "We need permission to access your SMS messages.",
          variant: "destructive"
        });
      }
    } else {
      setShowPasteDialog(true);
    }
  };
  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste your SMS transaction messages first.",
        variant: "destructive"
      });
      return;
    }
    try {
      const transactions = smsReader.parseTransactionsFromText(pastedText);
      if (transactions.length > 0) {
        toast({
          title: "Success!",
          description: `${transactions.length} transactions extracted.`
        });
        if (onTransactionsImport) {
          onTransactionsImport(transactions);
        }
        setShowPasteDialog(false);
        setPastedText('');
      } else {
        toast({
          title: "No transactions found",
          description: "We couldn't extract any transaction data from the provided text.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error parsing transactions:", error);
      toast({
        title: "Error processing text",
        description: "There was an error processing the pasted text. Please check the format.",
        variant: "destructive"
      });
    }
  };
  return <header className="border-b-4 border-neo-black mb-6 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">FIRM D1 PROJECT - LDC - COPY & PASTE MESSAGES THERE >>>>>> </h1>
          <p className="text-neo-gray font-medium mt-1">African AI Tool to Extract Insights from Mobile Money Transactions - FIRM D1 Research Project LDC (c) 2025</p>
        </div>
        <div>
          <button className="neo-button bg-neo-yellow flex items-center gap-2" onClick={handleSmsImport}>
            {smsReader.isNativePlatform() ? <>
                <Smartphone className="w-5 h-5" /> READ SMS
              </> : <>
                <Clipboard className="w-5 h-5" /> PASTE SMS
              </>}
          </button>
        </div>
      </div>
      
      {showPasteDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="neo-card max-w-xl w-full m-4">
            <h2 className="text-2xl font-bold mb-4">PASTE TRANSACTION SMS</h2>
            <p className="mb-4">
              Copy the transaction SMS messages from your phone and paste them below.
              Multiple messages can be pasted together.
            </p>
            
            <textarea className="w-full h-64 p-4 border-2 border-neo-black mb-4" placeholder="Paste your SMS transaction messages here..." value={pastedText} onChange={e => setPastedText(e.target.value)}></textarea>
            
            <div className="flex gap-4 justify-end">
              <button className="neo-button bg-transparent border-2 border-neo-black" onClick={() => {
            setShowPasteDialog(false);
            setPastedText('');
          }}>
                CANCEL
              </button>
              <button className="neo-button bg-neo-yellow" onClick={handlePasteSubmit}>
                PROCESS
              </button>
            </div>
          </div>
        </div>}
    </header>;
};
export default Header;