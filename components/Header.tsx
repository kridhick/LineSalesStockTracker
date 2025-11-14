// components/Header.tsx
import React from 'react';
import { APP_NAME } from '../constants';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 bg-primary text-white shadow-lg py-4 px-4 sm:px-6">
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
        {/* Potentially add user profile or other header actions here */}
        <div>
          {/* <button className="text-white">User</button> */}
        </div>
      </div>
    </header>
  );
};
