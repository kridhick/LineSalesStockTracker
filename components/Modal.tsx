// components/Modal.tsx
import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-card rounded-lg shadow-xl max-w-lg w-full p-6 sm:p-8 transform transition-all scale-100 opacity-100 z-50">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h3 className="text-xl font-bold text-textPrimary">{title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};
