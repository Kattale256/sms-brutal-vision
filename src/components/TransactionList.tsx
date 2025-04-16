
import React, { useState } from 'react';
import { Transaction } from '../services/SmsReader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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
  
  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
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
      <h2 className="text-2xl font-bold mb-4">TRANSACTION LIST</h2>
      
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
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
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
                  {transaction.sender && <div>From: {transaction.sender}</div>}
                  {transaction.recipient && <div>To: {transaction.recipient}</div>}
                  {transaction.fee !== undefined && <div>Fee: {transaction.fee.toFixed(2)} {transaction.currency}</div>}
                  {transaction.balance !== undefined && <div>Balance: {transaction.balance.toFixed(2)} {transaction.currency}</div>}
                  {transaction.reference && <div>Ref: {transaction.reference}</div>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionList;
