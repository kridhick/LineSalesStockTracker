// components/Button.tsx
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75';
  let variantStyles = '';
  let sizeStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary text-white hover:bg-indigo-700 focus:ring-primary';
      break;
    case 'secondary':
      variantStyles = 'bg-secondary text-white hover:bg-teal-600 focus:ring-secondary';
      break;
    case 'danger':
      variantStyles = 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500';
      break;
    case 'outline':
      variantStyles = 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary';
      break;
    case 'ghost':
      variantStyles = 'text-primary hover:bg-indigo-50 dark:hover:bg-indigo-900/50 focus:ring-primary';
      break;
    default:
      break;
  }

  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1 text-sm';
      break;
    case 'md':
      sizeStyles = 'px-4 py-2';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-lg';
      break;
    default:
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" color="text-white" />
      ) : (
        children
      )}
    </button>
  );
};
