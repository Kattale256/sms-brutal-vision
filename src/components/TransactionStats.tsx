import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Transaction } from '../services/SmsReader';
import { Button } from './ui/button';
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  getTotalsByType, 
  getTotalFees, 
  getTotalIncome,
  getAverageTransactionAmount,
  getFeesByDate,
  getFrequentContacts
} from '../utils/transactionAnalyzer';

interface TransactionStatsProps {
  transactions: Transaction[];
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactions }) => {
  const totalsByType = getTotalsByType(transactions);
  const totalFees = getTotalFees(transactions);
  const totalIncome = getTotalIncome(transactions);
  const averageAmounts = getAverageTransactionAmount(transactions);
  const feesByDate = getFeesByDate(transactions);
  const frequentContacts = getFrequentContacts(transactions);
  
  const typeLabels = {
    send: 'Sent',
    receive: 'Received',
    payment: 'Payments',
    withdrawal: 'Withdrawals',
    deposit: 'Deposits',
    other: 'Other'
  };
  
  const chartData = Object.entries(totalsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, amount]) => ({
      name: typeLabels[type as keyof typeof typeLabels],
      amount: amount
    }));
  
  const feesChartData = Object.entries(feesByDate).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fees: amount
  }));
  
  const totalOut = totalsByType.send + totalsByType.payment + totalsByType.withdrawal;
  const balance = totalIncome - totalOut;
  
  const currencyMap: Record<string, number> = {};
  transactions.forEach(t => {
    currencyMap[t.currency] = (currencyMap[t.currency] || 0) + 1;
  });
  const mainCurrency = Object.entries(currencyMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'USD';

  const recipientsData = Object.entries(frequentContacts)
    .map(([name, count]) => ({
      name: name || 'Unknown',
      value: count
    }));

  const exportToExcel = () => {
    const currentExportCount = parseInt(localStorage.getItem('exportCount') || '0', 10);
    localStorage.setItem('exportCount', (currentExportCount + 1).toString());
    
    const workbook = XLSX.utils.book_new();
    
    const summaryData = Object.entries(totalsByType).map(([type, amount]) => ({
      Type: typeLabels[type as keyof typeof typeLabels],
      Amount: `${amount.toFixed(2)} ${mainCurrency}`
    }));
    const summaryWS = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWS, "Transaction Summary");
    
    const overviewData = [
      { Metric: 'Money In', Value: `${totalIncome.toFixed(2)} ${mainCurrency}` },
      { Metric: 'Money Out', Value: `${totalOut.toFixed(2)} ${mainCurrency}` },
      { Metric: 'Fees Paid', Value: `${totalFees.toFixed(2)} ${mainCurrency}` },
      { Metric: 'Financial Health', Value: `${balance.toFixed(2)} ${mainCurrency}` }
    ];
    const overviewWS = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewWS, "Financial Overview");
    
    const feesData = Object.entries(feesByDate).map(([date, fee]) => ({
      Date: new Date(date).toLocaleDateString(),
      Fees: `${fee.toFixed(2)} ${mainCurrency}`
    }));
    const feesWS = XLSX.utils.json_to_sheet(feesData);
    XLSX.utils.book_append_sheet(workbook, feesWS, "Fees Over Time");

    const recipientsExcelData = recipientsData.map(item => ({
      Recipient: item.name,
      Frequency: item.value
    }));
    const recipientsWS = XLSX.utils.json_to_sheet(recipientsExcelData);
    XLSX.utils.book_append_sheet(workbook, recipientsWS, "Recipients");
    
    const copyrightData = [
      { Notice: 'Extracted By Firm D1 Research Project on E-Payment Message Notification Analysis.' },
      { Notice: '(c) 2025 FIRM D1, LDC KAMPALA' }
    ];
    const copyrightWS = XLSX.utils.json_to_sheet(copyrightData);
    XLSX.utils.book_append_sheet(workbook, copyrightWS, "Copyright");
    
    XLSX.writeFile(workbook, "transaction-stats.xlsx");
  };

  const exportToPDF = () => {
    const currentExportCount = parseInt(localStorage.getItem('exportCount') || '0', 10);
    localStorage.setItem('exportCount', (currentExportCount + 1).toString());
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Transaction Statistics Report", 20, 20);
    
    doc.setFontSize(16);
    doc.text("Transaction Summary", 20, 40);
    const summaryData = Object.entries(totalsByType)
      .filter(([_, value]) => value > 0)
      .map(([type, amount]) => [
        typeLabels[type as keyof typeof typeLabels],
        `${amount.toFixed(2)} ${mainCurrency}`
      ]);
    
    let finalY = 45;
    autoTable(doc, {
      startY: finalY,
      head: [['Type', 'Amount']],
      body: summaryData,
      didParseCell: (data) => {
        finalY = Math.max(finalY, data.cell.y + data.cell.height);
      }
    });
    
    doc.text("Financial Overview", 20, finalY + 10);
    const overviewData = [
      ['Money In', `${totalIncome.toFixed(2)} ${mainCurrency}`],
      ['Money Out', `${totalOut.toFixed(2)} ${mainCurrency}`],
      ['Fees Paid', `${totalFees.toFixed(2)} ${mainCurrency}`],
      ['Financial Health', `${balance.toFixed(2)} ${mainCurrency}`]
    ];
    
    finalY += 15;
    autoTable(doc, {
      startY: finalY,
      head: [['Metric', 'Value']],
      body: overviewData,
      didParseCell: (data) => {
        finalY = Math.max(finalY, data.cell.y + data.cell.height);
      }
    });
    
    doc.text("Fees Over Time", 20, finalY + 10);
    const feesData = Object.entries(feesByDate).map(([date, fee]) => [
      new Date(date).toLocaleDateString(),
      `${fee.toFixed(2)} ${mainCurrency}`
    ]);
    
    finalY += 15;
    autoTable(doc, {
      startY: finalY,
      head: [['Date', 'Fees']],
      body: feesData,
      didParseCell: (data) => {
        finalY = Math.max(finalY, data.cell.y + data.cell.height);
      }
    });

    const recipientsData = Object.entries(frequentContacts).map(([name, count]) => [
      name || 'Unknown',
      count.toString()
    ]);
    
    finalY += 15;
    autoTable(doc, {
      startY: finalY,
      head: [['Recipient', 'Frequency']],
      body: recipientsData,
      didParseCell: (data) => {
        finalY = Math.max(finalY, data.cell.y + data.cell.height);
      }
    });
    
    doc.setFontSize(10);
    doc.text("Extracted By Firm D1 Research Project on E-Payment Message Notification Analysis.", 20, finalY + 20);
    doc.text("(c) 2025 FIRM D1, LDC KAMPALA", 20, finalY + 25);
    
    doc.save("transaction-stats.pdf");
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-end gap-2">
        <Button onClick={exportToExcel} variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export to Excel
        </Button>
        <Button onClick={exportToPDF} variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Export to PDF
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neo-chart">
          <h2 className="text-2xl font-bold mb-4">TRANSACTION SUMMARY</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#1A1F2C" />
              <YAxis stroke="#1A1F2C" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid #1A1F2C',
                  borderRadius: '0px'
                }}
                itemStyle={{ color: '#1A1F2C' }}
                labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
                formatter={(value) => [`${value} ${mainCurrency}`, 'Amount']}
              />
              <Bar dataKey="amount" fill="#FF5252" stroke="#1A1F2C" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="neo-chart">
          <h2 className="text-2xl font-bold mb-4">FINANCIAL OVERVIEW</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-neo-black p-4">
              <h3 className="text-lg font-bold">MONEY IN</h3>
              <p className="text-2xl font-bold text-green-600">{totalIncome.toFixed(2)} {mainCurrency}</p>
            </div>
            <div className="border-2 border-neo-black p-4">
              <h3 className="text-lg font-bold">MONEY OUT</h3>
              <p className="text-2xl font-bold text-red-600">{totalOut.toFixed(2)} {mainCurrency}</p>
            </div>
            <div className="border-2 border-neo-black p-4">
              <h3 className="text-lg font-bold">FEES PAID</h3>
              <p className="text-2xl font-bold text-neo-gray">{totalFees.toFixed(2)} {mainCurrency}</p>
            </div>
            <div className="border-2 border-neo-black p-4">
              <h3 className="text-lg font-bold">FINANCIAL HEALTH</h3>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {balance.toFixed(2)} {mainCurrency}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neo-chart">
          <h2 className="text-2xl font-bold mb-4">FEES OVER TIME</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feesChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="date" stroke="#1A1F2C" />
              <YAxis stroke="#1A1F2C" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid #1A1F2C',
                  borderRadius: '0px'
                }}
                itemStyle={{ color: '#1A1F2C' }}
                labelStyle={{ color: '#1A1F2C', fontWeight: 'bold' }}
                formatter={(value) => [`${value} ${mainCurrency}`, 'Fees']}
              />
              <Bar dataKey="fees" fill="#FFC107" stroke="#1A1F2C" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neo-chart">
          <h2 className="text-2xl font-bold mb-4">TRANSACTION RECIPIENTS</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={recipientsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {recipientsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1A1F2C" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} transactions`, 'Frequency']}
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid #1A1F2C',
                  borderRadius: '0px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;
