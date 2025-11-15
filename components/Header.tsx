// components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { APP_NAME } from '../constants.js';
import { Theme, User } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, theme, toggleTheme, user, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-primary text-white shadow-lg py-4 px-4 sm:px-6 no-print">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white mr-4 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{APP_NAME}</h1>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white rounded-full"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            {user?.picture ? (
              <img src={user.picture} alt="User" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-400"></div>
            )}
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
              <div className="px-4 py-3 border-b dark:border-slate-700">
                <p className="text-sm text-textPrimary dark:text-slate-200">Signed in as</p>
                <p className="text-sm font-medium text-textPrimary dark:text-slate-200 truncate">{user?.name}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                  className="flex justify-between items-center w-full px-4 py-2 text-sm text-textPrimary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span>Toggle Theme</span>
                  {theme === 'light' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                  )}
                </button>
              </div>
              <div className="border-t dark:border-slate-700">
                <button
                  onClick={() => { onSignOut(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
