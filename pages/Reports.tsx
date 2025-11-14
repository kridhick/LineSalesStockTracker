// pages/Reports.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { DailyStockReportEntry } from '../types';
import { dataService } from '../services/dataService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Table } from '../components/Table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useToast from '../hooks/useToast';
import { formatDate } from '../utils/dateUtils';
import { TableColumn } from '../components/Table'; // Import TableColumn

export const Reports: React.FC = () => {
  const [reportDate, setReportDate] = useState<string>(formatDate(new Date()));
  const [reportData, setReportData] = useState<DailyStockReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const fetchReport = useCallback(async (date: string) => {
    setIsLoading(true);
    try {
      const fetchedReport = await dataService.getDailyStockReport(date);
      setReportData(fetchedReport);
      addToast('Daily stock report generated!', 'info');
    } catch (error) {
      console.error('Failed to fetch daily stock report:', error);
      addToast('Failed to generate daily stock report.', 'error');
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchReport(reportDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportDate]); // Re-fetch when reportDate changes

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReportDate(e.target.value);
  };

  // Fix: Explicitly define the type of the columns array
  const columns: TableColumn<DailyStockReportEntry>[] = [
    { key: 'itemName', header: 'Item Name' },
    { key: 'openingStock', header: 'Opening Stock', className: 'font-semibold' },
    { key: 'stockIn', header: 'Stock In', className: 'text-green-600' },
    { key: 'stockOut', header: 'Stock Out', className: 'text-red-600' },
    { key: 'closingStock', header: 'Closing Stock', className: 'font-bold' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-6">Daily Stock Report</h2>

      <div className="bg-card p-6 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-grow w-full sm:w-auto">
          <Input
            id="reportDate"
            label="Select Date"
            type="date"
            value={reportDate}
            onChange={handleDateChange}
            max={formatDate(new Date())} // Cannot select a future date
          />
        </div>
        {/*
          <Button onClick={() => fetchReport(reportDate)} variant="primary" isLoading={isLoading} disabled={isLoading}>
            Generate Report
          </Button>
        */}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-full min-h-[40vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Table<DailyStockReportEntry>
          data={reportData}
          columns={columns}
          keyExtractor={(entry) => entry.itemId}
          emptyMessage="No stock movements recorded for this date or no items found."
        />
      )}
    </div>
  );
};