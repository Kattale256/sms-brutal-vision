
import React, { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Transaction } from '../services/SmsReader';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Handle } from './ui/dnd-handle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TransactionCalendarProps {
  transactions: Transaction[];
}

const TransactionCalendar: React.FC<TransactionCalendarProps> = ({ transactions }) => {
  // Collect dates where transactions happened
  const dates = transactions.map(t => new Date(t.timestamp));
  
  // Get all unique months from transactions
  const months: Record<string, Date> = {};
  dates.forEach(date => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!months[monthKey]) {
      months[monthKey] = new Date(date.getFullYear(), date.getMonth(), 1);
    }
  });

  // Convert to sorted array of month dates
  const monthArray = Object.values(months).sort((a, b) => a.getTime() - b.getTime());
  
  // Remove duplicate days
  const markedDates = Array.from(
    new Set(dates.map(date => date.toISOString().split('T')[0]))
  ).map(d => new Date(d));
  
  // Get current month
  const currentDate = new Date();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  
  // Create tabs data
  const currentMonthIdx = monthArray.findIndex(
    m => m.getMonth() === currentDate.getMonth() && m.getFullYear() === currentDate.getFullYear()
  );
  if (currentMonthIdx !== -1) {
    setSelectedMonthIndex(currentMonthIdx);
  }

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
      
      {monthArray.length > 0 ? (
        <Tabs defaultValue={monthArray[selectedMonthIndex].toISOString()} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 w-full h-auto">
            {monthArray.map((month, index) => (
              <TabsTrigger 
                key={month.toISOString()} 
                value={month.toISOString()}
                className="text-xs sm:text-sm"
              >
                {month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {monthArray.map(month => (
            <TabsContent key={month.toISOString()} value={month.toISOString()}>
              <Calendar
                mode="multiple"
                selected={markedDates}
                month={month}
                disabled={() => true}
                modifiers={{
                  transaction: markedDates
                }}
                modifiersClassNames={{
                  transaction: "bg-neo-yellow border-neo-black border-2 text-black"
                }}
                className="w-full"
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-8">No transaction dates available</div>
      )}
      
      <p className="mt-3 text-neo-gray text-sm">
        Highlighted dates contain transactions.
      </p>
    </div>
  );
};

export default TransactionCalendar;
