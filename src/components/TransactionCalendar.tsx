
import React from 'react';
import { Calendar } from './ui/calendar';
import { Transaction } from '../services/SmsReader';

interface TransactionCalendarProps {
  transactions: Transaction[];
}

const TransactionCalendar: React.FC<TransactionCalendarProps> = ({ transactions }) => {
  // Collect dates where transactions happened
  const dates = transactions.map(t => new Date(t.timestamp));
  // Remove duplicate days
  const markedDates = Array.from(
    new Set(dates.map(date => date.toISOString().split('T')[0]))
  ).map(d => new Date(d));
  // Range
  const minDate = markedDates.length
    ? new Date(Math.min(...markedDates.map(d => d.getTime())))
    : undefined;
  const maxDate = markedDates.length
    ? new Date(Math.max(...markedDates.map(d => d.getTime())))
    : undefined;

  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">TRANSACTION CALENDAR</h2>
      <Calendar
        mode="multiple"
        selected={markedDates}
        fromDate={minDate}
        toDate={maxDate}
        disabled={() => true}
        modifiers={{
          transaction: markedDates
        }}
        modifiersClassNames={{
          transaction: "bg-neo-yellow border-neo-black border-2 text-black"
        }}
        className="w-full"
      />
      <p className="mt-3 text-neo-gray text-sm">
        Highlighted dates contain transactions.
      </p>
    </div>
  );
};

export default TransactionCalendar;
