
import React, { useState } from 'react';
import { Transaction } from '../services/SmsReader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Type labels
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payment',
    withdrawal: 'Withdrawal',
    deposit: 'Deposit',
    other: 'Other'
  };
  
  // Handle sort
  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Get unique transaction types
  const transactionTypes = [...new Set(transactions.map(t => t.type))];
  
  // Filter transactions by type
  const filteredTransactions = selectedType
    ? transactions.filter(t => t.type === selectedType)
    : transactions;
  
  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortField === 'timestamp') {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'amount' || sortField === 'fee' || sortField === 'balance') {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    } else {
      const valA = String(a[sortField] || '');
      const valB = String(b[sortField] || '');
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
  });

  return (
    <div className="neo-card mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-2xl font-bold">TRANSACTION LIST</h2>
        
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <button
            className={`px-3 py-1 border-2 border-neo-black ${
              selectedType === null ? 'bg-neo-yellow' : 'bg-transparent'
            }`}
            onClick={() => setSelectedType(null)}
          >
            All
          </button>
          {transactionTypes.map(type => (
            <button
              key={type}
              className={`px-3 py-1 border-2 border-neo-black ${
                selectedType === type ? 'bg-neo-yellow' : 'bg-transparent'
              }`}
              onClick={() => setSelectedType(type)}
            >
              {typeLabels[type as keyof typeof typeLabels]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('type')} className="cursor-pointer">
                Type {sortField === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead onClick={() => handleSort('amount')} className="cursor-pointer">
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer">
                Date {sortField === 'timestamp' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead onClick={() => handleSort('reference')} className="cursor-pointer">
                TID {sortField === 'reference' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {typeLabels[transaction.type]}
                  </TableCell>
                  <TableCell className={
                    transaction.type === 'receive' || transaction.type === 'deposit' 
                      ? 'text-green-600 font-bold' 
                      : 'text-red-600 font-bold'
                  }>
                    {transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-'}
                    {transaction.amount.toFixed(2)} {transaction.currency}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleDateString()} 
                    {' '}
                    {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    {transaction.reference || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {transaction.fee !== undefined && transaction.fee > 0 ? (
                      <span className="text-amber-600">{transaction.fee.toFixed(2)} {transaction.currency}</span>
                    ) : (
                      transaction.tax !== undefined && transaction.tax > 0 ? (
                        <div>
                          <span className="text-amber-600">{transaction.tax.toFixed(2)} {transaction.currency} (Tax)</span>
                          {transaction.fee !== undefined && transaction.fee > 0 && (
                            <span className="text-amber-600 block">
                              {transaction.fee.toFixed(2)} {transaction.currency} (Fee)
                            </span>
                          )}
                        </div>
                      ) : 'None'
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.type === 'receive' && transaction.sender && (
                      <div>From: {transaction.sender}</div>
                    )}
                    {transaction.type === 'send' && transaction.recipient && (
                      <div>To: {transaction.recipient}</div>
                    )}
                    {transaction.type === 'withdrawal' && transaction.agentId && (
                      <div>Agent ID: {transaction.agentId}</div>
                    )}
                    {transaction.type === 'payment' && transaction.recipient && (
                      <div>Business: {transaction.recipient}</div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionList;
