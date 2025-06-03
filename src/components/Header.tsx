import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import SmsReader from '../services/sms/SmsReader';
import { Transaction } from '../services/sms/types';
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
        setShowPasteDialog(false);

        // Directly import transactions
        if (onTransactionsImport) {
          onTransactionsImport(transactions);
        }
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
  return <header className="border-b-4 border-neo-black mb-6 pb-6 bg-white rounded-lg shadow-neo">
      <div className="flex flex-col gap-4">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tighter text-neo-black text-center">
            AKAMEME TAX APP - FIRM D1 PROJECT
          </h1>
          <p className="text-neo-gray font-medium mt-2 text-sm lg:text-base">
            African AI Tool to Extract Insights from Mobile Money Transactions - FIRM D1 Research Project LDC (c) 2025
          </p>
        </div>
        
        {/* Large prominent PASTE SMS button */}
        <div className="flex justify-center">
          <button className="w-full max-w-sm h-16 bg-neo-yellow hover:bg-yellow-400 text-neo-black font-bold text-xl border-4 border-neo-black shadow-neo hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200 rounded-lg flex items-center justify-center gap-3" onClick={handleSmsImport}>
            {smsReader.isNativePlatform() ? <>
                <Smartphone className="w-8 h-8" /> 
                READ SMS
              </> : <>
                <Clipboard className="w-8 h-8" /> 
                PASTE SMS
              </>}
          </button>
        </div>
      </div>
      
      {showPasteDialog && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-neo-black max-w-2xl w-full mx-4 shadow-neo rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">PASTE TRANSACTION SMS</h2>
              <p className="mb-4 text-center">
                Copy as many transaction SMS messages as you want from your phone and paste them below.
                Multiple messages can be pasted together.
              </p>
              
              <textarea className="w-full h-64 p-4 border-2 border-neo-black mb-4 rounded-lg resize-none focus:outline-none focus:border-neo-yellow" placeholder="Paste your SMS transaction messages here..." value={pastedText} onChange={e => setPastedText(e.target.value)} />
              
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button className="flex-1 sm:flex-none px-6 py-3 bg-transparent border-2 border-neo-black font-bold hover:bg-gray-100 transition-colors rounded-lg" onClick={() => {
              setShowPasteDialog(false);
              setPastedText('');
            }}>
                  CANCEL
                </button>
                <button className="flex-1 sm:flex-none px-6 py-3 bg-neo-yellow hover:bg-yellow-400 border-2 border-neo-black font-bold shadow-neo-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200 rounded-lg" onClick={handlePasteSubmit}>
                  PROCESS
                </button>
              </div>
            </div>
          </div>
        </div>}
    </header>;
};
export default Header;