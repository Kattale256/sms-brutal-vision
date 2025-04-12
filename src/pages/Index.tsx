
import React from 'react';
import Header from '../components/Header';
import MessageStats from '../components/MessageStats';
import MessageTimeline from '../components/MessageTimeline';
import MessageCategories from '../components/MessageCategories';
import MessageList from '../components/MessageList';
import { sampleSmsData } from '../data/sampleData';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <main>
          <MessageStats messages={sampleSmsData} />
          <MessageTimeline messages={sampleSmsData} />
          <MessageCategories messages={sampleSmsData} />
          <MessageList messages={sampleSmsData} />
        </main>
        
        <footer className="mt-12 pt-6 border-t-4 border-neo-black text-center">
          <p className="text-neo-gray">SMS ANALYZER • NEO-BRUTALIST DESIGN • 2025</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
