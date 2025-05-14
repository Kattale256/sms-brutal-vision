
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getTotalFees, getTotalTaxes } from '../../utils/transactionAnalyzer';

interface TaxesChartProps {
  transactions: Transaction[];
}

const TaxesChart: React.FC<TaxesChartProps> = ({ transactions }) => {
  const totalFees = getTotalFees(transactions);
  const totalTaxes = getTotalTaxes(transactions);
  
  const data = [
    { name: 'Fees', value: totalFees },
    { name: 'Taxes', value: totalTaxes }
  ].filter(item => item.value > 0);
  
  // Get most common currency
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';
  
  const COLORS = ['#FF5252', '#FFC107'];
  
  const isEmpty = data.every(item => item.value === 0);
  
  return (
    <div className="neo-chart">
      <h2 className="text-2xl font-bold mb-4">FEES & TAXES PAID</h2>
      {isEmpty ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-neo-gray">No fees or taxes data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1A1F2C" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(2)} ${mainCurrency}`} />
            <Legend 
              formatter={(value, entry, index) => {
                const item = data[index];
                return `${value} (${item.value.toFixed(2)} ${mainCurrency})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TaxesChart;
