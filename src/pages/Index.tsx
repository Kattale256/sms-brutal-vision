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
import TransactionContacts from '../components/TransactionContacts';
import TransactionList from '../components/TransactionList';
import SurveyForm from '../components/SurveyForm';

const Index = () => {
  const [messages, setMessages] = useState<SmsMessage[]>(sampleSmsData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<'sms' | 'transactions'>('sms');
  const [showSurveyPrompt, setShowSurveyPrompt] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
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

  useEffect(() => {
    if (scrollBottomCount >= 3 && !showSurvey && !showSurveyPrompt) {
      setShowSurveyPrompt(true);
    }
  }, [scrollBottomCount, showSurvey, showSurveyPrompt]);

  const handleSmsImport = (importedMessages: SmsMessage[]) => {
    setMessages(importedMessages);
    setActiveView('sms');
  };

  const handleTransactionsImport = (importedTransactions: Transaction[]) => {
    setTransactions(importedTransactions);
    setActiveView('transactions');
  };

  const handleSurveyLater = () => setShowSurveyPrompt(false);
  const handleSurveyNow = () => {
    setShowSurveyPrompt(false);
    setShowSurvey(true);
  };
  const handleSurveyComplete = () => setShowSurvey(false);

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
        {showSurvey && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="relative z-10">
              <SurveyForm onComplete={handleSurveyComplete} />
            </div>
          </div>
        )}
        {showSurveyPrompt && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col gap-4 max-w-sm items-center">
              <div className="text-lg font-bold">Would you like to take a quick survey?</div>
              <div className="text-sm text-center text-gray-500 mb-4">Your feedback helps us improve.</div>
              <div className="flex gap-4">
                <button className="neo-button bg-neo-yellow" onClick={handleSurveyNow}>
                  DO IT NOW
                </button>
                <button className="neo-button bg-gray-200 border border-neo-black" onClick={handleSurveyLater}>
                  LATER
                </button>
              </div>
            </div>
          </div>
        )}
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
