
import React, { useState } from 'react';
import Header from '../components/Header';
import MessageStats from '../components/MessageStats';
import MessageTimeline from '../components/MessageTimeline';
import MessageCategories from '../components/MessageCategories';
import MessageList from '../components/MessageList';
import { sampleSmsData, SmsMessage } from '../data/sampleData';
import { Capacitor } from '@capacitor/core';

const Index = () => {
  const [messages, setMessages] = useState<SmsMessage[]>(sampleSmsData);
  
  const handleSmsImport = (importedMessages: SmsMessage[]) => {
    setMessages(importedMessages);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <Header onSmsImport={handleSmsImport} />
        
        <main>
          <MessageStats messages={messages} />
          <MessageTimeline messages={messages} />
          <MessageCategories messages={messages} />
          <MessageList messages={messages} />
        </main>
        
        <footer className="mt-8 pt-4 border-t-4 border-neo-black text-center">
          <p className="text-neo-gray text-sm">
            SMS ANALYZER • NEO-BRUTALIST DESIGN • {new Date().getFullYear()}
            {Capacitor.isNativePlatform() ? ' • MOBILE APP' : ''}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
