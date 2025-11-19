import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { supabase } from '../services/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrMsg(error.message);
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setErrMsg('');
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setErrMsg(error.message);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setErrMsg(error.message);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">{APP_NAME}</h1>
        <p className="text-lg text-textSecondary dark:text-slate-400 mb-8">Sign in to manage your inventory.</p>
        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <input
            type="email"
            required
            placeholder="Email"
            className="input bg-white dark:bg-slate-800 border p-2 w-full"
            value={email}
            autoComplete="username"
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="input bg-white dark:bg-slate-800 border p-2 w-full"
            value={password}
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>
        <form className="space-y-4 mt-3" onSubmit={handleSignUp}>
          <button
            type="submit"
            className="bg-secondary text-white px-4 py-2 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Sign up (create account)'}
          </button>
        </form>
        <div className="my-3 text-xs text-slate-400">or</div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded w-full"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </button>
        {errMsg && <p className="mt-4 text-red-600 text-xs">{errMsg}</p>}
        <p className="mt-8 text-xs text-slate-400">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
};
