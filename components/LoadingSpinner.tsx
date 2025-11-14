// components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-primary',
  className = '',
}) => {
  let spinnerSize = '';
  switch (size) {
    case 'sm':
      spinnerSize = 'h-4 w-4';
      break;
    case 'md':
      spinnerSize = 'h-6 w-6';
      break;
    case 'lg':
      spinnerSize = 'h-8 w-8';
      break;
    default:
      break;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-current border-t-transparent ${spinnerSize} ${color}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};
