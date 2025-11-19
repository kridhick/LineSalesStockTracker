// components/Header.tsx
import React from 'react';
import { APP_NAME } from '../constants';
import { Theme } from '../types';
import { User } from '@supabase/supabase-js';
import { Button } from './Button';

interface HeaderProps {
  onToggleSidebar: () => void;
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, theme, toggleTheme, user, onSignOut }) => {
  return (
    <header className="sticky top-0 z-30 bg-primary text-white shadow-lg py-3 px-4 sm:px-6 no-print">
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
        
        <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="flex items-center p-2 rounded-full text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
              )}
            </button>
            {user && (
              <div className="flex items-center space-x-3">
                <img 
                  src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata.full_name || 'User'}&background=random`} 
                  alt="User avatar" 
                  className="h-9 w-9 rounded-full" 
                />
                <Button onClick={onSignOut} variant="ghost" size="sm" className="hidden sm:block text-white hover:bg-white/20">
                  Sign Out
                </Button>
                 <button onClick={onSignOut} className="sm:hidden p-2 rounded-full text-white hover:bg-white/20 focus:outline-none" aria-label="Sign out">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                 </button>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};