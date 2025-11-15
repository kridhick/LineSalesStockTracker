// components/Login.tsx
import React from 'react';
import { APP_NAME } from '../constants.js';

export const Login: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">{APP_NAME}</h1>
        <p className="text-lg text-textSecondary dark:text-slate-400 mb-8">
          Sign in to manage your inventory.
        </p>
        
        {/* The Google Sign-In button will be rendered here by the GSI library */}
        <div id="signInDiv" className="flex justify-center"></div>

        <p className="mt-8 text-xs text-slate-400">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
};
