
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Transaction } from '../../services/SmsReader';
import { getTotalFees, getTotalTaxes } from '../../utils/transactionAnalyzer';
import { useIsMobile } from '../../hooks/use-mobile';

interface TaxesChartProps {
  transactions: Transaction[];
  hideLegendPointers?: boolean;
}

const TaxesChart: React.FC<TaxesChartProps> = ({ transactions, hideLegendPointers = false }) => {
  const isMobile = useIsMobile();
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
      <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4">FEES & TAXES PAID</h2>
      {isEmpty ? (
        <div className="flex justify-center items-center h-[250px] sm:h-[300px]">
          <p className="text-neo-gray text-sm">No fees or taxes data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 70 : 100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#1A1F2C" 
                  strokeWidth={isMobile ? 1 : 2} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                fontSize: isMobile ? '12px' : '14px'
              }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return `${value.toFixed(2)} ${mainCurrency}`;
                }
                return `${value} ${mainCurrency}`;
              }} 
            />
            {!hideLegendPointers && (
              <Legend 
                verticalAlign="bottom" 
                height={isMobile ? 30 : 36}
                wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                formatter={(value, entry, index) => {
                  const item = data[index];
                  return (
                    <span style={{ color: '#1A1F2C', fontWeight: 'bold' }}>
                      {value} ({item.value.toFixed(2)} {mainCurrency})
                    </span>
                  );
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TaxesChart;
