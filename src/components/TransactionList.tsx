
import React, { useState } from 'react';
import { Transaction } from '../services/SmsReader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TransactionListProps {
  transactions: Transaction[];
}

interface TransactionCategorization {
  id: string;
  category: string;
  subCategory?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [categorizations, setCategorizations] = useState<TransactionCategorization[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payment',
    withdrawal: 'Withdrawal',
    deposit: 'Deposit'
  };
  
  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const transactionTypes = [...new Set(transactions.map(t => t.type))];
  
  const filteredTransactions = selectedType
    ? transactions.filter(t => t.type === selectedType)
    : transactions;
  
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
  
  // Pagination logic
  const displayedTransactions = itemsPerPage === -1 ? sortedTransactions : sortedTransactions.slice(0, itemsPerPage);
  
  const handleCategoryChange = (transactionId: string, category: string) => {
    setCategorizations(prev => {
      const existingIndex = prev.findIndex(c => c.id === transactionId);
      if (existingIndex >= 0) {
        const newCategorizations = [...prev];
        newCategorizations[existingIndex] = { 
          ...newCategorizations[existingIndex], 
          category,
          subCategory: undefined // Clear subcategory when main category changes
        };
        return newCategorizations;
      } else {
        return [...prev, { id: transactionId, category }];
      }
    });
  };
  
  const handleSubCategoryChange = (transactionId: string, subCategory: string) => {
    setCategorizations(prev => {
      const existingIndex = prev.findIndex(c => c.id === transactionId);
      if (existingIndex >= 0) {
        const newCategorizations = [...prev];
        newCategorizations[existingIndex] = { ...newCategorizations[existingIndex], subCategory };
        return newCategorizations;
      }
      return prev;
    });
  };
  
  const getCategorization = (transactionId: string) => {
    return categorizations.find(c => c.id === transactionId);
  };
  
  const BUSINESS_INCOME_SUBCATEGORIES = [
    { value: 'sales', label: 'Sales Revenue' },
    { value: 'service-fees', label: 'Service Fees' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'commissions', label: 'Commissions' },
    { value: 'rental-income', label: 'Rental Income' },
    { value: 'royalties', label: 'Royalties' },
    { value: 'interest', label: 'Interest' },
    { value: 'dividends', label: 'Dividends' },
    { value: 'other-income', label: 'Other Income' },
  ];

  const BUSINESS_EXPENSE_SUBCATEGORIES = [
    { value: 'advertising', label: 'Advertising' },
    { value: 'office-expenses', label: 'Office Expenses' },
    { value: 'rent', label: 'Rent' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'salaries-wages', label: 'Salaries & Wages' },
    { value: 'travel', label: 'Travel' },
    { value: 'meals-entertainment', label: 'Meals & Entertainment' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'taxes-licenses', label: 'Taxes & Licenses' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'repairs-maintenance', label: 'Repairs & Maintenance' },
    { value: 'other-expenses', label: 'Other Expenses' },
  ];

  return (
    <div className="neo-card mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-2xl font-bold">TRANSACTION LIST</h2>
        
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="-1">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2">
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
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
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
              <TableHead>Taxes</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Business Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((transaction, idx) => {
                const categorization = getCategorization(transaction.id);
                const subcategories = categorization?.category === 'business-income' 
                  ? BUSINESS_INCOME_SUBCATEGORIES 
                  : BUSINESS_EXPENSE_SUBCATEGORIES;
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">
                      {typeLabels[transaction.type as keyof typeof typeLabels]}
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
                      ) : 'None'}
                    </TableCell>
                    <TableCell>
                      {transaction.tax !== undefined && transaction.tax > 0 ? (
                        <span className="text-amber-600">{transaction.tax.toFixed(2)} {transaction.currency}</span>
                      ) : 'None'}
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
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <Select 
                          value={categorization?.category || ""}
                          onValueChange={(value) => handleCategoryChange(transaction.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Categorize..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business-income">Business Income</SelectItem>
                            <SelectItem value="business-expense">Business Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {categorization?.category && (
                          <Select 
                            value={categorization.subCategory || ""}
                            onValueChange={(value) => handleSubCategoryChange(transaction.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Subcategory..." />
                            </SelectTrigger>
                            <SelectContent>
                              {subcategories.map(sub => (
                                <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {itemsPerPage !== -1 && sortedTransactions.length > itemsPerPage && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Showing {Math.min(itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
