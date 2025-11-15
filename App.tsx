// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { Page, Theme, User } from './types';
import { Dashboard } from './pages/Dashboard';
import { ItemMaster } from './pages/ItemMaster';
import { VehicleMaster } from './pages/VehicleMaster';
import { CategoryMaster } from './pages/CategoryMaster';
import { StockIn } from './pages/StockIn';
import { StockOut } from './pages/StockOut';
import { Reports } from './pages/Reports';
import { Login } from './components/Login'; // Import Login page
import useToast from './hooks/useToast';

// Add a global declaration for the google object from the GSI script
declare global {
  interface Window {
    google: any;
  }
}

// A simple JWT decoder to get user info from the credential
function decodeJwtResponse(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

// TODO: Replace with your actual Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const { toasts, addToast, removeToast } = useToast();

  const handleCredentialResponse = useCallback((response: any) => {
    try {
      const decoded = decodeJwtResponse(response.credential);
      const newUser: User = {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      setUser(newUser);
      addToast(`Welcome, ${newUser.name}!`, 'success');
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      addToast("Failed to sign in.", 'error');
    }
  }, [addToast]);
  
  const handleSignOut = useCallback(() => {
    setUser(null);
    // This prevents the One Tap prompt from showing automatically on the next page load.
    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
    addToast("You have been signed out.", 'info');
  }, [addToast]);

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      // Render the button in the Login component if the element exists
      const signInDiv = document.getElementById("signInDiv");
      if (signInDiv) {
        window.google.accounts.id.renderButton(
          signInDiv,
          { theme: "outline", size: "large", type: 'standard', text: 'signin_with' }
        );
      }
      
      // Show the One Tap prompt if user is not logged in
      if (!user) {
        window.google.accounts.id.prompt();
      }
    } else {
       if (!user) console.error("Google Identity Services script not loaded.");
    }
  }, [handleCredentialResponse, user]);

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
