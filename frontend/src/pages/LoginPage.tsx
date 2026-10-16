import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scissors, Mail, Lock, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { loginUser } from '../store/authSlice.js';
import { loginFormSchema } from '../validators/schemas.js';
import { showErrorToast, showSuccessToast } from '../store/toastSlice.js';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);

    const validation = loginFormSchema.safeParse({ email, password });
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please enter valid email and password';
      setLocalErr(msg);
      dispatch(showErrorToast(msg, 'Validation Error'));
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      dispatch(showSuccessToast('Logged in successfully! Welcome back.'));
      const loggedUser = result.payload;
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } else if (loginUser.rejected.match(result)) {
      const errMsg = (result.payload as string) || 'Login failed. Please check your credentials.';
      setLocalErr(errMsg);
      dispatch(showErrorToast(errMsg, 'Login Error'));
    }
  };

  // Quick 1-click test credentials
  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    setLocalErr(null);
    const demoEmail = role === 'admin' ? 'admin@bookease.com' : 'customer@bookease.com';
    const demoPassword = 'Password123!';
    setEmail(demoEmail);
    setPassword(demoPassword);

    const result = await dispatch(loginUser({ email: demoEmail, password: demoPassword }));
    if (loginUser.fulfilled.match(result)) {
      dispatch(
        showSuccessToast(
          `Logged in successfully as ${role === 'admin' ? 'Administrator' : 'Customer'}! Welcome back.`
        )
      );
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Perfect Darshan
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="text-xs text-gray-500 mt-1">Sign in to manage appointments & bookings</p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="mb-6 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl">
          <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-2 text-center">
            ⚡ Quick 1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Client Demo</span>
            </button>
          </div>
        </div>

        {(error || localErr) && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localErr || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (email && /^\d+$/.test(email.trim())) {
                    dispatch(showErrorToast('Email address cannot be just numbers. Please enter a valid email.', 'Invalid Email'));
                  }
                }}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="font-semibold text-purple-700 hover:underline">
            Register now
          </Link>
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
