
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import MessageStats from '../components/MessageStats';
import MessageTimeline from '../components/MessageTimeline';
import MessageCategories from '../components/MessageCategories';
import MessageList from '../components/MessageList';
import { sampleSmsData, SmsMessage } from '../data/sampleData';
import { Transaction } from '../services/SmsReader';
import { Capacitor } from '@capacitor/core';
import TransactionStats from '../components/TransactionStats';
import TransactionTimeline from '../components/TransactionTimeline';
import TransactionCalendar from '../components/TransactionCalendar';
import TransactionContacts from '../components/TransactionContacts';
import TransactionList from '../components/TransactionList';

const Index = () => {
  const [messages, setMessages] = useState<SmsMessage[]>(sampleSmsData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<'sms' | 'transactions'>('sms');
  const [scrollBottomCount, setScrollBottomCount] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!resultsRef.current) return;
      const el = resultsRef.current;
      if (window.scrollY + window.innerHeight >= el.offsetTop + el.offsetHeight - 40) {
        setScrollBottomCount((prev) => Math.min(3, prev + 1));
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmsImport = (importedMessages: SmsMessage[]) => {
    setMessages(importedMessages);
    setActiveView('sms');
    setScrollBottomCount(0);
  };

  const handleTransactionsImport = (importedTransactions: Transaction[]) => {
    setTransactions(importedTransactions);
    setActiveView('transactions');
    setScrollBottomCount(0);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <Header
          onSmsImport={handleSmsImport}
          onTransactionsImport={handleTransactionsImport}
        />

        {transactions.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 border-2 border-neo-black">
              <button
                className={`px-4 py-2 ${activeView === 'transactions' ? 'bg-neo-yellow' : 'bg-transparent'}`}
                onClick={() => setActiveView('transactions')}
              >
                TRANSACTIONS
              </button>
              <button
                className={`px-4 py-2 ${activeView === 'sms' ? 'bg-neo-yellow' : 'bg-transparent'}`}
                onClick={() => setActiveView('sms')}
              >
                SMS MESSAGES
              </button>
            </div>
          </div>
        )}

        <main ref={resultsRef}>
          {activeView === 'transactions' && transactions.length > 0 ? (
            <>
              <TransactionStats transactions={transactions} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TransactionTimeline transactions={transactions} />
                <TransactionCalendar transactions={transactions} />
              </div>
              <TransactionContacts transactions={transactions} />
              <TransactionList transactions={transactions} />
            </>
          ) : (
            <>
              <MessageStats messages={messages} />
              <MessageTimeline messages={messages} />
              <MessageCategories messages={messages} />
              <MessageList messages={messages} />
            </>
          )}
        </main>

        <footer className="mt-8 pt-4 border-t-4 border-neo-black text-center">
          <p className="text-neo-gray text-sm">
            D1 PROJECT • LDC KAMPALA • {new Date().getFullYear()}
            {Capacitor.isNativePlatform() ? ' • MOBILE APP' : ''}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
