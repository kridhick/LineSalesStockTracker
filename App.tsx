// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { Page, Theme } from './types';
import { Dashboard } from './pages/Dashboard';
import { ItemMaster } from './pages/ItemMaster';
import { VehicleMaster } from './pages/VehicleMaster';
import { CategoryMaster } from './pages/CategoryMaster';
import { StockIn } from './pages/StockIn';
import { StockOut } from './pages/StockOut';
import { Reports } from './pages/Reports';
import useToast from './hooks/useToast';
import { supabase } from './services/supabase';
import { User } from '@supabase/supabase-js';
import { Login } from './components/Login';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    // Determine initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Apply theme to the document and save preference
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setAuthLoading(true);
    // onAuthStateChange handles initial session detection, sign-ins, and sign-outs
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false); // Stop loading once the auth state is determined
    });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error", error);
      addToast('Failed to sign out.', 'error');
    } else {
      addToast('Signed out successfully.', 'success');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD: return <Dashboard />;
      case Page.ITEM_MASTER: return <ItemMaster />;
      case Page.VEHICLE_MASTER: return <VehicleMaster />;
      case Page.CATEGORY_MASTER: return <CategoryMaster />;
      case Page.STOCK_IN: return <StockIn />;
      case Page.STOCK_OUT: return <StockOut />;
      case Page.REPORTS: return <Reports />;
      default: return <Dashboard />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background dark:bg-slate-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          onToggleSidebar={toggleSidebar} 
          theme={theme} 
          toggleTheme={toggleTheme}
          user={user}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-y-auto bg-background dark:bg-slate-900">
          {renderPage()}
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;