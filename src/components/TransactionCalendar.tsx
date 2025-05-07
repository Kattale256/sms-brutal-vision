
import React from 'react';
import { Calendar } from './ui/calendar';
import { Transaction } from '../services/SmsReader';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Handle } from './ui/dnd-handle';

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
  
  // Get current month and previous month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // For previous month
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousMonthYear = previousMonthDate.getFullYear();

  // Range
  const minDate = markedDates.length
    ? new Date(Math.min(...markedDates.map(d => d.getTime())))
    : undefined;
  const maxDate = markedDates.length
    ? new Date(Math.max(...markedDates.map(d => d.getTime())))
    : undefined;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: "transaction-calendar" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="neo-chart relative">
      <div className="absolute top-2 right-2 cursor-move" {...attributes} {...listeners}>
        <Handle />
      </div>
      <h2 className="text-2xl font-bold mb-4">TRANSACTION CALENDAR</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{previousMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <Calendar
            mode="multiple"
            selected={markedDates}
            month={previousMonthDate}
            disabled={() => true}
            modifiers={{
              transaction: markedDates
            }}
            modifiersClassNames={{
              transaction: "bg-neo-yellow border-neo-black border-2 text-black"
            }}
            className="w-full"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <Calendar
            mode="multiple"
            selected={markedDates}
            month={currentDate}
            disabled={() => true}
            modifiers={{
              transaction: markedDates
            }}
            modifiersClassNames={{
              transaction: "bg-neo-yellow border-neo-black border-2 text-black"
            }}
            className="w-full"
          />
        </div>
      </div>
      <p className="mt-3 text-neo-gray text-sm">
        Highlighted dates contain transactions.
      </p>
    </div>
  );
};

export default TransactionCalendar;
