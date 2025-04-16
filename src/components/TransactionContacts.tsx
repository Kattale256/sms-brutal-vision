
import React from 'react';
import { Transaction } from '../services/SmsReader';
import { getFrequentContacts, getAverageTransactionAmount } from '../utils/transactionAnalyzer';
import { ArrowUpRight, ArrowDownRight, CreditCard, Banknote } from 'lucide-react';

interface TransactionContactsProps {
  transactions: Transaction[];
}

const TransactionContacts: React.FC<TransactionContactsProps> = ({ transactions }) => {
  const frequentContacts = getFrequentContacts(transactions);
  const averageAmounts = getAverageTransactionAmount(transactions);
  
  // Format labels for transaction types
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  // Get the most frequent currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UGX';

  // Icons for transaction types
  const typeIcons = {
    send: <ArrowUpRight className="h-5 w-5" />,
    receive: <ArrowDownRight className="h-5 w-5" />,
    payment: <CreditCard className="h-5 w-5" />,
    withdrawal: <Banknote className="h-5 w-5" />,
    deposit: <Banknote className="h-5 w-5" />,
    other: <CreditCard className="h-5 w-5" />
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="neo-card">
        <h2 className="text-2xl font-bold mb-4">TOP CONTACTS</h2>
        <div className="space-y-2">
          {Object.entries(frequentContacts).length > 0 ? (
            Object.entries(frequentContacts).map(([contact, count], index) => (
              <div key={contact} className="flex justify-between items-center border-b-2 border-neo-black pb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-none bg-neo-yellow border-2 border-neo-black flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium">{contact}</span>
                </div>
                <div className="text-xl font-bold">{count}</div>
              </div>
            ))
          ) : (
            <div className="text-neo-gray">No contact data available</div>
          )}
        </div>
      </div>

      <div className="neo-card">
        <h2 className="text-2xl font-bold mb-4">AVERAGE AMOUNTS</h2>
        <div className="space-y-2">
          {Object.entries(averageAmounts)
            .filter(([_, amount]) => amount > 0)
            .map(([type, average]) => (
              <div key={type} className="flex justify-between items-center border-b-2 border-neo-black pb-2">
                <div className="flex items-center">
                  {typeIcons[type as keyof typeof typeIcons]}
                  <span className="font-medium ml-2">
                    {typeLabels[type as keyof typeof typeLabels]}
                  </span>
                </div>
                <div className="text-xl font-bold">
                  {average.toFixed(2)} {mainCurrency}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionContacts;
