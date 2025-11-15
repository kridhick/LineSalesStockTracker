// pages/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';
import useToast from '../hooks/useToast';
import { Item, Vehicle, Transaction, TransactionType, LowStockAlert } from '../types';
import { formatDate } from '../utils/dateUtils';

interface StockSummary {
  totalItems: number;
  totalVehicles: number;
  totalStockQuantity: number;
}

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedSummary = await dataService.getStockSummary();
      setSummary(fetchedSummary);

      const alerts = await dataService.getLowStockItems();
      setLowStockAlerts(alerts);

      // Fetch all transactions, then filter for the last 5 relevant ones
      const allTransactions = await dataService.getTransactions();
      const sortedTransactions = [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(sortedTransactions.slice(0, 5)); // Show up to 5 most recent transactions

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const seedData = async () => {
    setIsLoading(true);
    try {
      await dataService.seedData();
      addToast('Sample data seeded successfully!', 'success');
      await fetchDashboardData(); // Re-fetch dashboard data after seeding
    } catch (error) {
      console.error('Failed to seed data:', error);
      addToast('Failed to seed sample data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold text-textPrimary dark:text-slate-100 mb-8">Dashboard Overview</h2>

      {lowStockAlerts.length > 0 && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-accent dark:border-amber-500 text-amber-800 dark:text-amber-300 p-4 rounded-lg shadow-md mb-8" role="alert">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold text-lg">Low Stock Alerts!</p>
          </div>
          <ul className="list-disc list-inside mt-2 ml-4">
            {lowStockAlerts.map(alert => (
              <li key={alert.itemId}>
                <strong>{alert.itemName}</strong> is low on stock. Current: <span className="font-semibold">{alert.currentStock}</span>, Threshold: <span className="font-semibold">{alert.lowStockThreshold}</span>.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4 border-primary">
          <h3 className="text-lg font-semibold text-textSecondary dark:text-slate-400 mb-2">Total Items</h3>
          <p className="text-4xl font-bold text-textPrimary dark:text-slate-100">{summary?.totalItems ?? 0}</p>
        </div>
        <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4 border-secondary">
          <h3 className="text-lg font-semibold text-textSecondary dark:text-slate-400 mb-2">Total Vehicles</h3>
          <p className="text-4xl font-bold text-textPrimary dark:text-slate-100">{summary?.totalVehicles ?? 0}</p>
        </div>
        <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md border-l-4 border-accent">
          <h3 className="text-lg font-semibold text-textSecondary dark:text-slate-400 mb-2">Total Stock Quantity</h3>
          <p className="text-4xl font-bold text-textPrimary dark:text-slate-100">{summary?.totalStockQuantity ?? 0}</p>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold text-textPrimary dark:text-slate-200 mb-4">Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-textPrimary dark:text-slate-300">{transaction.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-textPrimary dark:text-slate-300">{transaction.itemName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === TransactionType.STOCK_IN ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      }`}>
                        {transaction.type === TransactionType.STOCK_IN ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-textPrimary dark:text-slate-300">{transaction.quantity}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-textPrimary dark:text-slate-300">{transaction.vehicleName || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-textSecondary dark:text-slate-400">No recent transactions to display.</p>
        )}
      </div>

      {summary && summary.totalItems === 0 && summary.totalVehicles === 0 && (
        <div className="text-center p-6 bg-yellow-50 dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-slate-700">
          <p className="text-lg text-yellow-800 dark:text-slate-300 mb-4">It looks like your inventory is empty!</p>
          <Button onClick={seedData} variant="primary">
            Seed Sample Data
          </Button>
        </div>
      )}
    </div>
  );
};
