// components/Toast.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return ReactDOM.createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  let bgColor = 'bg-blue-500';
  let icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  switch (toast.type) {
    case 'success':
      bgColor = 'bg-emerald-500';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    case 'error':
      bgColor = 'bg-red-500';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-500';
      // Default icon is already info
      break;
  }

  return (
    <div className={`flex items-center ${bgColor} text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-md max-w-sm w-full transition-all duration-300 transform translate-x-0 opacity-100`}>
      <div className="flex-shrink-0 mr-3">{icon}</div>
      <div className="flex-grow">{toast.message}</div>
      <button
        type="button"
        onClick={onClose}
        className="ml-4 -mr-1 p-1 rounded-md inline-flex text-white hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
        aria-label="Close"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
