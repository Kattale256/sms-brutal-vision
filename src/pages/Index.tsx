import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import MessageStats from '../components/MessageStats';
import MessageTimeline from '../components/MessageTimeline';
import MessageCategories from '../components/MessageCategories';
import MessageList from '../components/MessageList';
import { sampleSmsData, SmsMessage } from '../data/sampleData';
import { Transaction } from '../services/sms/types';
import { Capacitor } from '@capacitor/core';
import TransactionStats from '../components/transaction-stats';
import TransactionTimeline from '../components/TransactionTimeline';
import TransactionCalendar from '../components/TransactionCalendar';
import TransactionContacts from '../components/TransactionContacts';
import TransactionList from '../components/TransactionList';
import TransactionChat from '../components/TransactionChat';
import FileVerifier from '../components/security/FileVerifier';
import HowToUseVideo from '../components/HowToUseVideo';
import UserMenu from '../components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loadUserTransactions, saveUserTransactions } from '@/utils/transactionStorage';
import AISecurityBadge from '@/components/AISecurityBadge';
const Index = () => {
  const [messages, setMessages] = useState<SmsMessage[]>(sampleSmsData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<'sms' | 'transactions'>('sms');
  const [scrollBottomCount, setScrollBottomCount] = useState(0);
  const [userHasConfirmedTutorial, setUserHasConfirmedTutorial] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(['transaction-stats', 'transaction-timeline', 'transaction-calendar', 'top-contacts', 'transaction-list', 'transaction-chat']);
  const resultsRef = useRef<HTMLDivElement>(null);
  const downloadSectionRef = useRef<HTMLDivElement>(null);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const handleScroll = () => {
      if (!resultsRef.current) return;
      const el = resultsRef.current;
      if (window.scrollY + window.innerHeight >= el.offsetTop + el.offsetHeight - 40) {
        setScrollBottomCount(prev => Math.min(3, prev + 1));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user's saved transactions on component mount
  useEffect(() => {
    if (user) {
      loadSavedTransactions();
    }
  }, [user]);
  const loadSavedTransactions = async () => {
    if (!user) return;
    const savedTransactions = await loadUserTransactions(user);
    if (savedTransactions.length > 0) {
      setTransactions(savedTransactions);
      setActiveView('transactions');
    }
  };
  const handleSaveTransactions = async (transactionsToSave: Transaction[]) => {
    if (!user || transactionsToSave.length === 0) return;
    const result = await saveUserTransactions(user, transactionsToSave);
    if (result.success) {
      toast({
        title: "Transactions Saved",
        description: "Your transaction data has been securely saved."
      });
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save your transactions. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleSmsImport = (importedMessages: SmsMessage[]) => {
    setMessages(importedMessages);
    setActiveView('sms');
    setScrollBottomCount(0);
  };
  const handleTransactionsImport = (importedTransactions: Transaction[]) => {
    setTransactions(importedTransactions);
    setActiveView('transactions');
    setScrollBottomCount(0);

    // Auto-save transactions for authenticated users
    handleSaveTransactions(importedTransactions);

    // Scroll to download section after processing
    setTimeout(() => {
      if (downloadSectionRef.current) {
        downloadSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 500);
  };
  useEffect(() => {
    setSectionOrder(prevOrder => {
      if (!prevOrder.includes('transaction-chat')) {
        return [...prevOrder, 'transaction-chat'];
      }
      return prevOrder;
    });
  }, []);
  const renderTransactionSections = () => {
    const sections: Record<string, JSX.Element> = {
      'transaction-stats': <div ref={downloadSectionRef}>
          <TransactionStats transactions={transactions} />
        </div>,
      'transaction-timeline': <TransactionTimeline transactions={transactions} />,
      'transaction-calendar': <TransactionCalendar transactions={transactions} />,
      'top-contacts': <TransactionContacts transactions={transactions} />,
      'transaction-list': <TransactionList transactions={transactions} />,
      'transaction-chat': <TransactionChat transactions={transactions} />
    };
    return sectionOrder.filter(id => sections[id]).map(id => <div key={id}>
          {sections[id]}
        </div>);
  };
  return <div className="min-h-screen bg-silver-light p-2 sm:p-4">
      {/* AI Security Badge at the very top */}
      

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex-1 w-full">
            <Header onSmsImport={handleSmsImport} onTransactionsImport={handleTransactionsImport} />
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <UserMenu />
          </div>
        </div>

        {/* Tutorial and Verification - Show tutorial with highlight until confirmed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <HowToUseVideo onUserConfirmed={() => setUserHasConfirmedTutorial(true)} />
          <FileVerifier />
        </div>

        {/* View Toggle */}
        {transactions.length > 0 && <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 border-2 border-neo-black bg-white rounded-lg overflow-hidden">
              <button className={`px-4 py-2 font-bold transition-all ${activeView === 'transactions' ? 'bg-neo-yellow text-neo-black' : 'bg-transparent hover:bg-silver-light'}`} onClick={() => setActiveView('transactions')}>
                TRANSACTIONS
              </button>
              <button className={`px-4 py-2 font-bold transition-all ${activeView === 'sms' ? 'bg-neo-yellow text-neo-black' : 'bg-transparent hover:bg-silver-light'}`} onClick={() => setActiveView('sms')}>
                SMS MESSAGES
              </button>
            </div>
          </div>}

        <main ref={resultsRef} className="space-y-6">
          {activeView === 'transactions' && transactions.length > 0 ? renderTransactionSections() : <>
              <MessageStats messages={messages} />
              <MessageTimeline messages={messages} />
              <MessageCategories messages={messages} />
              <MessageList messages={messages} />
            </>}
        </main>

        <footer className="mt-8 pt-4 border-t-4 border-neo-black text-center bg-white rounded-lg shadow-neo">
          <div className="flex flex-col items-center gap-2">
            <p className="text-neo-gray text-sm font-medium">
              AKAMEME TAX APP • FIRM D1 PROJECT • LDC KAMPALA • {new Date().getFullYear()}
              {Capacitor.isNativePlatform() ? ' • MOBILE APP' : ''}
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Built By <span className="font-bold text-neo-black">KATTALE GROUP (UG) EST. 2015</span>
            </p>
            {/* AI Security Badge at the very bottom */}
            <AISecurityBadge variant="minimal" />
          </div>
        </footer>
      </div>
    </div>;
};
export default Index;