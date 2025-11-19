// pages/Reports.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { DailyStockReportEntry, InventoryValuationEntry } from '../types';
import { dataService } from '../services/dataService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Table, TableColumn } from '../components/Table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';
import { formatDate } from '../utils/dateUtils';

declare global {
  interface Window {
    jspdf: any;
  }
}

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'valuation'>('daily');
  const [reportDate, setReportDate] = useState<string>(formatDate(new Date()));
  const [dailyReportData, setDailyReportData] = useState<DailyStockReportEntry[]>([]);
  const [valuationData, setValuationData] = useState<InventoryValuationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const fetchReports = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const [fetchedDailyReport, fetchedValuationReport] = await Promise.all([
        dataService.getDailyStockReport(date),
        dataService.getInventoryValuation(),
      ]);
      setDailyReportData(fetchedDailyReport);
      setValuationData(fetchedValuationReport);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      addToast('Failed to generate reports.', 'error');
      setDailyReportData([]);
      setValuationData([]);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchReports(reportDate);
  }, [reportDate, fetchReports]);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReportDate(e.target.value);
  };

  const handleExportPDF = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      if (activeTab === 'daily') {
        const title = `Daily Stock Report for ${new Date(reportDate).toLocaleDateString()}`;
        doc.text(title, 14, 15);
        (doc as any).autoTable({
          head: [['Item Name', 'Opening Stock', 'Stock In', 'Stock Out', 'Closing Stock']],
          body: dailyReportData.map(row => [row.itemName, row.openingStock, row.stockIn, row.stockOut, row.closingStock]),
          startY: 20,
        });
      } else {
        const title = 'Inventory Valuation Summary';
        doc.text(title, 14, 15);
        (doc as any).autoTable({
          head: [['Item Name', 'Category', 'Current Stock', 'Rate (₹)', 'Total Value (₹)']],
          body: valuationData.map(row => [row.itemName, row.category, row.currentStock, row.rate.toFixed(2), row.totalValue.toFixed(2)]),
          startY: 20,
        });

        const totalValue = valuationData.reduce((sum, item) => sum + item.totalValue, 0);
        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Inventory Value: ₹${totalValue.toFixed(2)}`, 14, finalY + 10);
      }
      
      doc.save(`${activeTab}_report_${formatDate(new Date())}.pdf`);
      addToast('Report exported to PDF successfully!', 'success');
    } catch (e) {
      console.error("Error exporting PDF:", e);
      addToast("Failed to export PDF. Please check your connection.", 'error');
    }
  };

  const { totalOpening, totalIn, totalOut, totalClosing } = dailyReportData.reduce(
    (acc, item) => {
      acc.totalOpening += item.openingStock;
      acc.totalIn += item.stockIn;
      acc.totalOut += item.stockOut;
      acc.totalClosing += item.closingStock;
      return acc;
    },
    { totalOpening: 0, totalIn: 0, totalOut: 0, totalClosing: 0 }
  );

  const totalInventoryValue = valuationData.reduce((sum, item) => sum + item.totalValue, 0);

  const dailyColumns: TableColumn<DailyStockReportEntry>[] = [
    { key: 'itemName', header: 'Item Name' },
    { key: 'openingStock', header: 'Opening Stock', className: 'bg-slate-50 dark:bg-slate-700/50' },
    { key: 'stockIn', header: 'Stock In', className: 'text-green-600 dark:text-green-400' },
    { key: 'stockOut', header: 'Stock Out', className: 'text-red-600 dark:text-red-400' },
    { key: 'closingStock', header: 'Closing Stock', className: 'font-bold bg-slate-50 dark:bg-slate-700/50' },
  ];
  
  const valuationColumns: TableColumn<InventoryValuationEntry>[] = [
    { key: 'itemName', header: 'Item Name' },
    { key: 'category', header: 'Category' },
    { key: 'currentStock', header: 'Current Stock' },
    { key: 'rate', header: 'Rate', render: (item) => `₹${item.rate.toFixed(2)}` },
    { key: 'totalValue', header: 'Total Value', render: (item) => `₹${item.totalValue.toFixed(2)}`, className: 'font-bold' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary dark:text-slate-200">Reports</h2>
        <Button onClick={handleExportPDF} variant="secondary" disabled={isLoading}>
          Export to PDF
        </Button>
      </div>

      <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
        <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('daily')}
              className={`${activeTab === 'daily' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Daily Stock Report
            </button>
            <button
              onClick={() => setActiveTab('valuation')}
              className={`${activeTab === 'valuation' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Inventory Valuation Summary
            </button>
          </nav>
        </div>

        {activeTab === 'daily' && (
          <div className="w-full sm:w-64 mb-4">
            <Input
              id="reportDate"
              label="Select Date"
              type="date"
              value={reportDate}
              onChange={handleDateChange}
              max={formatDate(new Date())}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-full min-h-[40vh]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div>
            {activeTab === 'daily' ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-textSecondary dark:text-slate-400">Total Opening</h4>
                    <p className="text-xl font-bold text-textPrimary dark:text-slate-200">{totalOpening}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Total In</h4>
                    <p className="text-xl font-bold text-green-800 dark:text-green-200">{totalIn}</p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Total Out</h4>
                    <p className="text-xl font-bold text-red-800 dark:text-red-200">{totalOut}</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-textSecondary dark:text-slate-400">Total Closing</h4>
                    <p className="text-xl font-bold text-textPrimary dark:text-slate-200">{totalClosing}</p>
                  </div>
                </div>
                <Table<DailyStockReportEntry>
                  data={dailyReportData}
                  columns={dailyColumns}
                  keyExtractor={(entry) => entry.itemId}
                  emptyMessage="No stock movements recorded for this date."
                />
              </>
            ) : (
              <>
                <Table<InventoryValuationEntry>
                  data={valuationData}
                  columns={valuationColumns}
                  keyExtractor={(entry) => entry.itemId}
                  emptyMessage="No items found to valuate."
                />
                <div className="text-right mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-lg font-bold text-textPrimary dark:text-slate-200">
                    Total Inventory Value: ₹{totalInventoryValue.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};