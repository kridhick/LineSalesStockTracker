// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { Page } from './types';
import { NAVIGATION_ITEMS } from './constants.js'; // Updated import path
import { Dashboard } from './pages/Dashboard';
import { ItemMaster } from './pages/ItemMaster';
import { VehicleMaster } from './pages/VehicleMaster';
import { StockIn } from './pages/StockIn';
import { StockOut } from './pages/StockOut';
import { Reports } from './pages/Reports';
import useToast from './hooks/useToast';
import { dataService } from './services/dataService'; // Import dataService for seeding

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    // Seed data on initial load if local storage is empty
    dataService.seedData();
  }, []);


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
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;