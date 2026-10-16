import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, User, Mail, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { registerUser } from '../store/authSlice.js';
import { registerFormSchema } from '../validators/schemas.js';
import { showErrorToast, showSuccessToast } from '../store/toastSlice.js';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);

    const validation = registerFormSchema.safeParse({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const msg = validation.error.errors.map((e) => e.message).filter(Boolean).join('. ') || 'Invalid form input';
      setLocalErr(msg);
      dispatch(showErrorToast(msg, 'Validation Error'));
      return;
    }

    const result = await dispatch(
      registerUser({
        name,
        email,
        password,
        confirmPassword,
        phone,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      dispatch(showSuccessToast('Account created successfully! Welcome.'));
      navigate('/');
    } else if (registerUser.rejected.match(result)) {
      const errMsg =
        (result.payload as string) ||
        result.error?.message ||
        'Registration failed. Please check your details.';
      setLocalErr(errMsg);
      dispatch(showErrorToast(errMsg, 'Registration Failed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Perfect Darshan
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900">Create Account</h2>
          <p className="text-xs text-gray-500 mt-1">Join BookEase to track & manage your bookings</p>
        </div>

        {(error || localErr) && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localErr || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onKeyDown={(e) => {
                  if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    dispatch(showErrorToast('Numbers are not allowed in Full Name field', 'Invalid Input'));
                  }
                }}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[0-9]/g, '');
                  setName(clean);
                }}
                placeholder="Julie Martin (Letters only)"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

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
                placeholder="julie@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number (10 digits) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onKeyDown={(e) => {
                  if (
                    ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
                    (e.ctrlKey || e.metaKey)
                  ) {
                    return;
                  }
                  if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    dispatch(showErrorToast('Letters are not allowed. Only numbers are accepted for phone number.', 'Invalid Phone'));
                  }
                }}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(digits);
                }}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars (1 uppercase, 1 lowercase, 1 number)"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters with 1 uppercase, 1 lowercase & 1 number</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-purple-700 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
