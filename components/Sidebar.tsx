// components/Sidebar.tsx
import React from 'react';
import { NAVIGATION_ITEMS } from '../constants';
import { Page } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:relative lg:flex lg:flex-col lg:w-64 flex-shrink-0`}
      >
        <div className="p-4 border-b border-gray-700 text-center text-xl font-bold">
          Menu
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul>
            {NAVIGATION_ITEMS.map((item) => (
              <li key={item.path} className="mb-2">
                <button
                  onClick={() => {
                    onNavigate(item.path);
                    onClose(); // Close sidebar on mobile after navigation
                  }}
                  className={`flex items-center w-full px-4 py-2 rounded-md transition duration-200 ease-in-out
                    ${
                      currentPage === item.path
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {/* Render SVG using the path string */}
                  <span className="mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={item.icon}
                      />
                    </svg>
                  </span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
