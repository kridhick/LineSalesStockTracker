// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { Page, Theme } from './types';
import { Dashboard } from './pages/Dashboard';
import { ItemMaster } from './pages/ItemMaster';
import { VehicleMaster } from './pages/VehicleMaster';
import { CategoryMaster } from './pages/CategoryMaster'; // Import new page
import { StockIn } from './pages/StockIn';
import { StockOut } from './pages/StockOut';
import { Reports } from './pages/Reports';
import useToast from './hooks/useToast';
import { dataService } from './services/dataService';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    dataService.seedData();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard />;
      case Page.ITEM_MASTER:
        return <ItemMaster />;
      case Page.VEHICLE_MASTER:
        return <VehicleMaster />;
      case Page.CATEGORY_MASTER:
        return <CategoryMaster />; // Add case for new page
      case Page.STOCK_IN:
        return <StockIn />;
      case Page.STOCK_OUT:
        return <StockOut />;
      case Page.REPORTS:
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background dark:bg-slate-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 overflow-y-auto bg-background dark:bg-slate-900">
          {renderPage()}
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
