
import React, { useState, useEffect } from 'react';
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
import SurveyFormWrapper from '../components/SurveyFormWrapper';
import { useScrollPosition } from '../hooks/use-scroll-position';

const Index = () => {
  const [messages, setMessages] = useState<SmsMessage[]>(sampleSmsData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<'sms' | 'transactions'>('sms');
  const [showSurveyPrompt, setShowSurveyPrompt] = useState<boolean>(false);
  const [showSurvey, setShowSurvey] = useState<boolean>(false);
  const [surveyCompleted, setSurveyCompleted] = useState<boolean>(false);
  const isBottom = useScrollPosition();
  
  const handleSmsImport = (importedMessages: SmsMessage[]) => {
    setMessages(importedMessages);
    setActiveView('sms');
  };

  const handleTransactionsImport = (importedTransactions: Transaction[]) => {
    setTransactions(importedTransactions);
    setActiveView('transactions');
  };
  
  const handleSurveyComplete = () => {
    setSurveyCompleted(true);
    setShowSurvey(false);
    setShowSurveyPrompt(false);
  };

  const handleSurveyLater = () => {
    setShowSurveyPrompt(false);
  };

  const handleSurveyNow = () => {
    setShowSurvey(true);
    setShowSurveyPrompt(false);
  };

  useEffect(() => {
    if (isBottom && !showSurveyPrompt && !surveyCompleted && !showSurvey) {
      setShowSurveyPrompt(true);
    }
  }, [isBottom, showSurveyPrompt, surveyCompleted, showSurvey]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <Header 
          onSmsImport={handleSmsImport} 
          onTransactionsImport={handleTransactionsImport}
        />
        
        <main>
          {showSurvey ? (
            <SurveyFormWrapper 
              onComplete={handleSurveyComplete} 
              transactions={transactions}
            />
          ) : (
            <>
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

              {activeView === 'transactions' && transactions.length > 0 ? (
                <>
                  <TransactionStats transactions={transactions} />
                  <TransactionTimeline transactions={transactions} />
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

              {/* Survey Prompt */}
              {showSurveyPrompt && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white p-4 rounded-lg shadow-lg border-2 border-neo-black">
                  <h3 className="text-lg font-bold mb-2">Quick Survey</h3>
                  <p className="mb-4">Would you like to participate in a brief survey about your experience?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSurveyLater}
                      className="px-4 py-2 border-2 border-neo-black hover:bg-gray-100"
                    >
                      Do it Later
                    </button>
                    <button
                      onClick={handleSurveyNow}
                      className="px-4 py-2 bg-neo-yellow hover:bg-neo-yellow/80 border-2 border-neo-black"
                    >
                      Do it Now
                    </button>
                  </div>
                </div>
              )}
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
